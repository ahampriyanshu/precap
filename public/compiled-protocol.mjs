const markerPattern = /^[A-Za-z0-9_]+$/;

function assertMarker(marker) {
  if (typeof marker !== "string" || !markerPattern.test(marker)) {
    throw new TypeError(
      "The compiled report marker must contain only letters, digits, and underscores.",
    );
  }
}

function replaceHook(source, hook, replacement, label) {
  const matches = source.match(
    new RegExp(hook.source, `${hook.flags.replace("g", "")}g`),
  );
  if (matches?.length !== 1)
    throw new Error(`The ${label} harness hook is missing or ambiguous.`);
  return source.replace(hook, replacement);
}

function instrumentGo(source, marker, helper) {
  const originalLine = source
    .slice(0, source.search(/^var passed, failed int$/m))
    .split("\n").length;
  const helpers = `func ${helper}(kind string, value any) {
 b, err := json.Marshal(value)
 if err != nil { panic(err) }
 fmt.Printf("\\n${marker}%s %s\\n", kind, b)
}
var ${helper}Names = map[string]bool{}
func ${helper}Check(name, status, detail string) {
 original := name
 for occurrence := 2; ${helper}Names[name]; occurrence++ { name = fmt.Sprintf("%s (%d)", original, occurrence) }
 ${helper}Names[name] = true
 value := map[string]any{"name": name, "status": status}
 if detail != "" { value["detail"] = detail }
 ${helper}("CHECK", value)
}
`;
  source = replaceHook(
    source,
    /^var passed, failed int$/m,
    `${helpers}\n//line main.go:${originalLine}\n$&`,
    "Go counters",
  );
  source = replaceHook(
    source,
    /fmt\.Println\("PASS", name\)/,
    `$&; ${helper}Check(name, "passed", "")`,
    "Go success",
  );
  source = replaceHook(
    source,
    /fmt\.Printf\("FAIL %s: %v\\n", name, r\)/,
    `$&; ${helper}Check(name, "failed", fmt.Sprint(r))`,
    "Go failure",
  );
  return replaceHook(
    source,
    /fmt\.Printf\("%d passed; %d failed\\n", passed, failed\)/,
    `$&; ${helper}("SUMMARY", map[string]int{"methods": passed + failed, "failed": failed})`,
    "Go summary",
  );
}

function instrumentJava(source, marker, helper) {
  const helpers = String.raw`
    static String ${helper}Quote(String value) {
        StringBuilder out = new StringBuilder("\"");
        String hex = "0123456789abcdef";
        for (int i=0; i<value.length(); i++) {
            char c=value.charAt(i);
            if (c=='"') out.append("\\\"");
            else if (c=='\\') out.append("\\\\");
            else if (c<32) { out.append("\\u00"); out.append(hex.charAt(c/16)); out.append(hex.charAt(c%16)); }
            else out.append(c);
        }
        return out.append('"').toString();
    }
    static final java.util.Set<String> ${helper}Names = new java.util.HashSet<>();
    static synchronized void ${helper}Check(String name, String status, String detail) {
        String original=name;
        for (int occurrence=2; !${helper}Names.add(name); occurrence++) name=original+" ("+occurrence+")";
        System.out.println("\n${marker}CHECK {\"name\":"+${helper}Quote(name)+",\"status\":"+${helper}Quote(status)+(detail==null?"":",\"detail\":"+${helper}Quote(detail))+"}");
    }
    static String ${helper}Detail(Throwable error) {
        java.io.StringWriter trace=new java.io.StringWriter();
        error.printStackTrace(new java.io.PrintWriter(trace));
        return trace.toString();
    }
    static void ${helper}Summary() {
        System.out.println("\n${marker}SUMMARY {\"methods\":"+(passed+failed)+",\"failed\":"+failed+"}");
    }
`;
  source = replaceHook(
    source,
    /public class Main\s*\{/,
    `$&${helpers.replace(/\r?\n/g, " ")}`,
    "Java class",
  );
  source = replaceHook(
    source,
    /System\.out\.println\("PASS " \+ name\);/,
    `$& ${helper}Check(name,"passed",null);`,
    "Java success",
  );
  source = replaceHook(
    source,
    /System\.out\.println\("FAIL " \+ name \+ ": " \+ error\);/,
    `$& ${helper}Check(name,"failed",${helper}Detail(error));`,
    "Java failure",
  );
  return replaceHook(
    source,
    /System\.out\.println\("RESULT stage="\+stage\+" passed="\+passed\+" failed="\+failed\);/,
    `$& ${helper}Summary();`,
    "Java summary",
  );
}

function instrumentCpp(source, marker, helper) {
  const originalLine = source
    .slice(0, source.search(/namespace test\s*\{/))
    .split("\n").length;
  const helpers = String.raw`namespace ${helper} {
inline std::string quote(const std::string& value) {
 std::string out="\"";
 const char* hex="0123456789abcdef";
 for(unsigned char c:value) {
  if(c=='"') out+="\\\"";
  else if(c=='\\') out+="\\\\";
  else if(c<32) {out+="\\u00";out+=hex[c/16];out+=hex[c%16];}
  else out+=static_cast<char>(c);
 }
 return out+'"';
}
inline void check(const std::string& name,const std::string& status,const std::string& detail="") {
 static std::set<std::string> emitted;
 std::string label=name;
 unsigned occurrence=1;
 while(!emitted.insert(label).second) label=name+" ("+std::to_string(++occurrence)+")";
 std::cout << "\n${marker}CHECK {\"name\":" << quote(label) << ",\"status\":" << quote(status);
 if(!detail.empty()) std::cout << ",\"detail\":" << quote(detail);
 std::cout << "}\n" << std::flush;
}
inline void summary(int methods,int failed) {
 std::cout << "\n${marker}SUMMARY {\"methods\":" << methods << ",\"failed\":" << failed << "}\n" << std::flush;
}
}
`;
  source = replaceHook(
    source,
    /namespace test\s*\{/,
    `${helpers}\n#line ${originalLine} "main.cpp"\n$&`,
    "C++ test namespace",
  );
  source = replaceHook(
    source,
    /std::cout << "PASS " << name << '\\n';/,
    `$& ${helper}::check(name,"passed");`,
    "C++ success",
  );
  source = replaceHook(
    source,
    /std::cerr << "FAIL " << name << ": " << e\.what\(\) << '\\n';/,
    `$& ${helper}::check(name,"failed",e.what());`,
    "C++ failure",
  );
  source = replaceHook(
    source,
    /std::cerr << "FAIL " << name << ": unknown exception\\n";/,
    `$& ${helper}::check(name,"failed","unknown exception");`,
    "C++ unknown failure",
  );
  return replaceHook(
    source,
    /std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\\n";/,
    `$& ${helper}::summary(test::suites,test::failures);`,
    "C++ summary",
  );
}

/** Return an instrumented copy of a known curriculum harness. */
export function instrumentHarness(language, source, marker) {
  assertMarker(marker);
  if (typeof source !== "string")
    throw new TypeError("The native harness source must be text.");
  const helper = `precap_${marker}`;
  if (source.includes(helper))
    throw new Error("The native harness is already instrumented.");
  switch (language) {
    case "go":
      return instrumentGo(source, marker, helper);
    case "java":
      return instrumentJava(source, marker, helper);
    case "cpp":
      return instrumentCpp(source, marker, helper);
    default:
      throw new TypeError(`Unsupported compiled harness language: ${language}`);
  }
}

const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const onlyKeys = (value, keys) =>
  Object.keys(value).every((key) => keys.includes(key));

/** Convert framed native output into the existing UI Report; incomplete runs fail closed. */
export function readCompiledReport(result, marker) {
  assertMarker(marker);
  const checks = [];
  const names = new Set();
  const errors = [];
  let summary;
  let summaries = 0;
  const stdout = typeof result?.stdout === "string" ? result.stdout : "";
  if (typeof result?.stdout !== "string")
    errors.push("The native process returned no valid stdout stream.");
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.startsWith(marker)) continue;
    const frame = line.slice(marker.length).match(/^(CHECK|SUMMARY) (.*)$/s);
    if (!frame) {
      errors.push(
        "A native report frame has an unknown or malformed record type.",
      );
      continue;
    }
    const kind = frame[1];
    if (kind === "SUMMARY") summaries++;
    else if (summaries)
      errors.push("A native check appeared after the final summary.");
    let value;
    try {
      value = JSON.parse(frame[2]);
    } catch {
      errors.push(
        `A native ${kind.toLowerCase()} record contains malformed JSON.`,
      );
      continue;
    }
    if (kind === "CHECK") {
      if (
        !object(value) ||
        !onlyKeys(value, ["name", "status", "detail"]) ||
        typeof value.name !== "string" ||
        !value.name.trim() ||
        !["passed", "failed"].includes(value.status) ||
        (Object.hasOwn(value, "detail") && typeof value.detail !== "string")
      ) {
        errors.push("A native check record has invalid fields.");
        continue;
      }
      if (names.has(value.name.trim()))
        errors.push(
          `The native report repeats check ${JSON.stringify(value.name)}.`,
        );
      names.add(value.name.trim());
      checks.push({
        name: value.name,
        status: value.status,
        ...(Object.hasOwn(value, "detail") ? { detail: value.detail } : {}),
      });
    } else {
      if (
        !object(value) ||
        !onlyKeys(value, ["methods", "failed"]) ||
        !Number.isSafeInteger(value.methods) ||
        value.methods <= 0 ||
        !Number.isSafeInteger(value.failed) ||
        value.failed < 0 ||
        value.failed > value.methods
      ) {
        errors.push("The native summary has invalid counts.");
        continue;
      }
      summary = value;
    }
  }
  if (summaries !== 1 || !summary)
    errors.push(
      "The native process must emit exactly one valid final summary.",
    );
  if (!checks.length)
    errors.push("The native process reported no named checks.");
  if (
    summary &&
    (summary.methods !== checks.length ||
      summary.failed !==
        checks.filter((check) => check.status === "failed").length)
  ) {
    errors.push(
      "The native check records do not match the final summary counts.",
    );
  }
  const code = result?.code ?? result?.exitCode;
  if (
    !Number.isInteger(code) ||
    (result?.code !== undefined && result.code !== code) ||
    (result?.exitCode !== undefined && result.exitCode !== code)
  ) {
    errors.push("The native process returned no consistent exit code.");
  } else if (code !== 0 && !(code === 1 && summary?.failed > 0)) {
    errors.push(`The native process exited with code ${code}.`);
  }
  if (result?.termination !== undefined && result.termination !== "exited") {
    errors.push(
      `The native process did not finish normally (${String(result.termination)}).`,
    );
  }
  if (errors.length) {
    const stderr = typeof result?.stderr === "string" ? result.stderr : "";
    checks.push({
      name: "Native test execution",
      status: "error",
      detail: [...new Set(errors)].join("\n") + (stderr ? `\n\n${stderr}` : ""),
    });
  }
  const duration =
    Number.isFinite(result?.durationMs) && result.durationMs >= 0
      ? result.durationMs / 1000
      : 0;
  return {
    checks,
    methods: checks.length,
    skipped: 0,
    duration,
    passed:
      code === 0 &&
      errors.length === 0 &&
      checks.length > 0 &&
      checks.every((check) => check.status === "passed"),
  };
}
