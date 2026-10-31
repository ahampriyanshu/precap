// node_modules/@wasm-oj/contracts/dist/index.js
var WASM_OJ_CONTRACT_VERSION = 2;
var WASM_OJ_CONTRACT_ID = `wasm-oj-v2`;
var WASM_OJ_SCHEMAS = Object.freeze({
  clangPins: `${WASM_OJ_CONTRACT_ID}/clang-pins`,
  clangLibcxxPch: `${WASM_OJ_CONTRACT_ID}/clang-libcxx-pch`,
  clangToolchain: `${WASM_OJ_CONTRACT_ID}/clang-toolchain`,
  compileBatch: `${WASM_OJ_CONTRACT_ID}/compile-batch`,
  compileTrace: `${WASM_OJ_CONTRACT_ID}/compile-trace`,
  conformance: `${WASM_OJ_CONTRACT_ID}/conformance`,
  conformanceEvidence: `${WASM_OJ_CONTRACT_ID}/conformance-evidence`,
  conformanceMatrix: `${WASM_OJ_CONTRACT_ID}/conformance-matrix`,
  cppDependencyLock: `${WASM_OJ_CONTRACT_ID}/cpp-dependency-lock`,
  dependencyLock: `${WASM_OJ_CONTRACT_ID}/dependency-lock`,
  dependencyOfflineBundle: `${WASM_OJ_CONTRACT_ID}/dependency-offline-bundle`,
  incrementalBuildGraph: `${WASM_OJ_CONTRACT_ID}/incremental-build-graph`,
  interactiveRequest: `${WASM_OJ_CONTRACT_ID}/interactive-request`,
  goToolchain: `${WASM_OJ_CONTRACT_ID}/go-toolchain`,
  objectCache: `${WASM_OJ_CONTRACT_ID}/object-cache`,
  pythonToolchain: `${WASM_OJ_CONTRACT_ID}/python-toolchain`,
  replayBundle: `${WASM_OJ_CONTRACT_ID}/replay-bundle`,
  rustToolchain: `${WASM_OJ_CONTRACT_ID}/rust-toolchain`,
  runRequest: `${WASM_OJ_CONTRACT_ID}/run-request`,
  runtimeBundle: `${WASM_OJ_CONTRACT_ID}/runtime-bundle`,
  runtimeCoreLicenses: `${WASM_OJ_CONTRACT_ID}/runtime-core-licenses`,
  thirdPartyComponents: `${WASM_OJ_CONTRACT_ID}/third-party-components`,
  wasmerSdkLicenses: `${WASM_OJ_CONTRACT_ID}/wasmer-sdk-licenses`,
  toolchainPackage: `${WASM_OJ_CONTRACT_ID}/toolchain-package`
});
var WASM_OJ_STORAGE = Object.freeze({
  database: `${WASM_OJ_CONTRACT_ID}:storage`,
  databaseVersion: 2,
  dependencyCache: `${WASM_OJ_CONTRACT_ID}:dependencies`,
  incrementalBuildCache: `${WASM_OJ_CONTRACT_ID}:incremental-build-cache`,
  runtimeFilesCache: `${WASM_OJ_CONTRACT_ID}:runtime-files`,
  toolchainCache: `${WASM_OJ_CONTRACT_ID}:toolchains`
});
var LANGUAGES = Object.freeze([
  "c",
  "cpp",
  "rust",
  "python",
  "javascript",
  "typescript",
  "go"
]);
function assertLanguageIdentifier(language) {
  if (typeof language !== "string" || !language || language !== language.trim() || language.length > 128) throw new Error("Language identifiers must be non-empty, trimmed, and at most 128 characters.");
}
function isBuiltinLanguage(language) {
  return LANGUAGES.includes(language);
}
var DEPENDENCY_ECOSYSTEMS = Object.freeze([
  "cargo",
  "npm",
  "pypi",
  "go",
  "cpp"
]);
var WASM_OJ_ERROR_CODES = Object.freeze([
  "operation-cancelled",
  "operation-conflict",
  "invalid-input",
  "unsupported",
  "integrity-failure",
  "compiler-failure",
  "runner-failure",
  "judge-failure",
  "replay-failure",
  "dependency-failure",
  "storage-failure",
  "initialization-failure",
  "disposed",
  "internal-failure"
]);
var WASM_OJ_ERROR_STAGES = Object.freeze([
  "operation",
  "compile",
  "prepare",
  "run",
  "judge",
  "replay",
  "dependency",
  "storage",
  "initialize"
]);
var WasmOjError = class extends Error {
  code;
  stage;
  retryable;
  operationId;
  details;
  constructor(message, options) {
    super(message, options);
    if (!WASM_OJ_ERROR_CODES.includes(options.code)) throw new TypeError(`Invalid WASM-OJ error code '${String(options.code)}'.`);
    if (!WASM_OJ_ERROR_STAGES.includes(options.stage)) throw new TypeError(`Invalid WASM-OJ error stage '${String(options.stage)}'.`);
    if (options.retryable !== void 0 && typeof options.retryable !== "boolean") throw new TypeError("WASM-OJ error retryable must be a boolean.");
    if (options.operationId !== void 0 && (typeof options.operationId !== "string" || !options.operationId || options.operationId !== options.operationId.trim() || options.operationId.length > 128)) throw new TypeError("WASM-OJ error operationId must be non-empty, trimmed, and at most 128 characters.");
    this.name = "WasmOjError";
    this.code = options.code;
    this.stage = options.stage;
    this.retryable = options.retryable ?? false;
    this.operationId = options.operationId;
    this.details = validatedDetails(options.details);
  }
  toJSON() {
    return {
      name: "WasmOjError",
      message: this.message,
      code: this.code,
      stage: this.stage,
      retryable: this.retryable,
      ...this.operationId === void 0 ? {} : { operationId: this.operationId },
      ...this.details === void 0 ? {} : { details: { ...this.details } }
    };
  }
};
function validatedDetails(value) {
  if (value === void 0) return void 0;
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("WASM-OJ error details must be a plain object.");
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError("WASM-OJ error details must be a plain object.");
  const entries = Object.entries(value);
  if (entries.length > 32) throw new RangeError("WASM-OJ error details may contain at most 32 entries.");
  const details = {};
  for (const [key, detail] of entries) {
    if (!key || key !== key.trim() || key.length > 128) throw new TypeError("WASM-OJ error detail keys must be non-empty, trimmed, and at most 128 characters.");
    if (typeof detail === "string" && detail.length <= 4096) details[key] = detail;
    else if (typeof detail === "number" && Number.isFinite(detail)) details[key] = detail;
    else if (typeof detail === "boolean" || detail === null) details[key] = detail;
    else throw new TypeError(`WASM-OJ error detail '${key}' has an unsupported value.`);
  }
  return Object.freeze(details);
}
function asWasmOjError(error, options) {
  if (error instanceof WasmOjError) {
    if (error.operationId !== void 0 || options.operationId === void 0) return error;
    return new WasmOjError(error.message, {
      code: error.code,
      stage: error.stage,
      retryable: error.retryable,
      operationId: options.operationId,
      details: error.details,
      cause: error
    });
  }
  return new WasmOjError(error instanceof Error ? error.message : String(error), {
    ...options,
    cause: error
  });
}

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b3 = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b3[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b3[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j2 = b3[i]; j2 < b3[i + 1]; ++j2) {
      r[j2] = j2 - b3[i] << 5 | i;
    }
  }
  return { b: b3, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x2 = (i & 43690) >> 1 | (i & 21845) << 1;
  x2 = (x2 & 52428) >> 2 | (x2 & 13107) << 2;
  x2 = (x2 & 61680) >> 4 | (x2 & 3855) << 4;
  rev[i] = ((x2 & 65280) >> 8 | (x2 & 255) << 8) >> 1;
}
var x2;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le2 = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le2[i] = le2[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le2[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le2[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt2) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt2)
    throw e;
  return e;
};
var inflt = function(dat, st2, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st2.f && !st2.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st2.i != 2;
  var noSt = st2.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st2.f || 0, pos = st2.p || 0, bt2 = st2.b || 0, lm = st2.l, dm = st2.d, lbt = st2.m, dbt = st2.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + l);
        buf.set(dat.subarray(s, t), bt2);
        st2.b = bt2 += l, st2.p = pos = t * 8, st2.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt2 = ldt.subarray(0, hLit), dt2 = ldt.subarray(hLit);
        lbt = max(lt2);
        dbt = max(dt2);
        lm = hMap(lt2, lbt, 1);
        dm = hMap(dt2, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt2 + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt2++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b3 = fleb[i];
          add = bits(dat, pos, (1 << b3) - 1) + fl[i];
          pos += b3;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt2 = fd[dsym];
        if (dsym > 3) {
          var b3 = fdeb[dsym];
          dt2 += bits16(dat, pos) & (1 << b3) - 1, pos += b3;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + 131072);
        var end = bt2 + add;
        if (bt2 < dt2) {
          var shift = dl - dt2, dend = Math.min(dt2, end);
          if (shift + bt2 < 0)
            err(3);
          for (; bt2 < dend; ++bt2)
            buf[bt2] = dict[shift + bt2];
        }
        for (; bt2 < end; ++bt2)
          buf[bt2] = buf[bt2 - dt2];
      }
    }
    st2.l = lm, st2.p = lpos, st2.b = bt2, st2.f = final;
    if (lm)
      final = 1, st2.m = lbt, st2.d = dm, st2.n = dbt;
  } while (!final);
  return bt2 != buf.length && noBuf ? slc(buf, 0, bt2) : buf.subarray(0, bt2);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b3) {
  return d[b3] | d[b3 + 1] << 8;
};
var b4 = function(d, b3) {
  return (d[b3] | d[b3 + 1] << 8 | d[b3 + 2] << 16 | d[b3 + 3] << 24) >>> 0;
};
var b8 = function(d, b3) {
  return b4(d, b3) + b4(d, b3 + 4) * 4294967296;
};
var gzs = function(d) {
  if (d[0] != 31 || d[1] != 139 || d[2] != 8)
    err(6, "invalid gzip data");
  var flg = d[3];
  var st2 = 10;
  if (flg & 4)
    st2 += (d[10] | d[11] << 8) + 2;
  for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st2++])
    ;
  return st2 + (flg & 2);
};
var Inflate = /* @__PURE__ */ (function() {
  function Inflate2(opts, cb) {
    if (typeof opts == "function")
      cb = opts, opts = {};
    this.ondata = cb;
    var dict = opts && opts.dictionary && opts.dictionary.subarray(-32768);
    this.s = { i: 0, b: dict ? dict.length : 0 };
    this.o = new u8(32768);
    this.p = new u8(0);
    if (dict)
      this.o.set(dict);
  }
  Inflate2.prototype.e = function(c) {
    if (!this.ondata)
      err(5);
    if (this.d)
      err(4);
    if (!this.p.length)
      this.p = c;
    else if (c.length) {
      var n = new u8(this.p.length + c.length);
      n.set(this.p), n.set(c, this.p.length), this.p = n;
    }
  };
  Inflate2.prototype.c = function(final) {
    this.s.i = +(this.d = final || false);
    var bts = this.s.b;
    var dt2 = inflt(this.p, this.s, this.o);
    this.ondata(slc(dt2, bts, this.s.b), this.d);
    this.o = slc(dt2, this.s.b - 32768), this.s.b = this.o.length;
    this.p = slc(this.p, this.s.p / 8 | 0), this.s.p &= 7;
  };
  Inflate2.prototype.push = function(chunk, final) {
    this.e(chunk), this.c(final);
  };
  return Inflate2;
})();
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var Gunzip = /* @__PURE__ */ (function() {
  function Gunzip2(opts, cb) {
    this.v = 1;
    this.r = 0;
    Inflate.call(this, opts, cb);
  }
  Gunzip2.prototype.push = function(chunk, final) {
    Inflate.prototype.e.call(this, chunk);
    this.r += chunk.length;
    if (this.v) {
      var p = this.p.subarray(this.v - 1);
      var s = p.length > 3 ? gzs(p) : 4;
      if (s > p.length) {
        if (!final)
          return;
      } else if (this.v > 1 && this.onmember) {
        this.onmember(this.r - p.length);
      }
      this.p = p.subarray(s), this.v = 0;
    }
    Inflate.prototype.c.call(this, 0);
    if (this.s.f && !this.s.l) {
      this.v = shft(this.s.p) + 9;
      this.s = { i: 0 };
      this.o = new u8(0);
      this.push(new u8(0), final);
    } else if (final) {
      Inflate.prototype.c.call(this, final);
    }
  };
  return Gunzip2;
})();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b3) {
  return b3 + 30 + b2(d, b3 + 26) + b2(d, b3 + 28);
};
var zh = function(d, b3, z2) {
  var fnl = b2(d, b3 + 28), efl = b2(d, b3 + 30), fn2 = strFromU8(d.subarray(b3 + 46, b3 + 46 + fnl), !(b2(d, b3 + 8) & 2048)), es = b3 + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z2, b4(d, b3 + 20), b4(d, b3 + 24), b4(d, b3 + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b3 + 10), sc, su, fn2, es + efl + b2(d, b3 + 32), off];
};
var z64hs = function(d, b3, l, z2, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b3 + l;
  var nf = nsc + nsu + noff;
  if (z2 && nf) {
    for (; b3 + 4 < e; b3 += 4 + b2(d, b3 + 2)) {
      if (b2(d, b3) == 1) {
        return [
          nsc ? b8(d, b3 + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b3 + 4) : su,
          noff ? b8(d, b3 + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z2 < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z2 = b4(data, e - 20) == 117853008;
  if (z2) {
    var ze2 = b4(data, e - 12);
    z2 = b4(data, ze2) == 101075792;
    if (z2) {
      c = b4(data, ze2 + 32);
      o = b4(data, ze2 + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z2), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn2 = _a2[3], no = _a2[4], off = _a2[5], b3 = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn2,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn2] = slc(data, b3, b3 + sc);
      else if (c_2 == 8)
        files[fn2] = inflateSync(data.subarray(b3, b3 + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// node_modules/@wasm-oj/core/dist/index.js
var DEFAULT_DETERMINISM = Object.freeze({
  randomSeed: 1592594996,
  realtimeEpochMs: Date.UTC(2e3, 0, 1),
  clockStepNs: 1e6
});
function resolveDeterminism(value) {
  const resolved = {
    ...DEFAULT_DETERMINISM,
    ...value
  };
  if (!Number.isInteger(resolved.randomSeed) || resolved.randomSeed < 0 || resolved.randomSeed > 4294967295) throw new RangeError("randomSeed must be an unsigned 32-bit integer.");
  if (!Number.isSafeInteger(resolved.realtimeEpochMs) || resolved.realtimeEpochMs < 0 || resolved.realtimeEpochMs > 18446744073e3) throw new RangeError("realtimeEpochMs must be a non-negative integer representable by a WASI timestamp.");
  if (!Number.isSafeInteger(resolved.clockStepNs) || resolved.clockStepNs < 1 || resolved.clockStepNs > 1e9) throw new RangeError("clockStepNs must be an integer from 1 through 1,000,000,000.");
  return resolved;
}
var encoder$3 = new TextEncoder();
var WEIGHTED_METER_MODEL = "weighted";
var MAX_LOGICAL_TIME_LIMIT_MS = Math.floor(Number.MAX_SAFE_INTEGER / 1e6);
var MAX_MEMORY_LIMIT_BYTES = 4294967296;
var MAX_WALL_TIME_LIMIT_MS = 6e5;
var DEFAULT_RESOURCE_POLICY = Object.freeze({
  instructionBudget: 1e10,
  logicalTimeLimitMs: 6e4,
  memoryLimitBytes: 268435456,
  outputLimitBytes: 4194304,
  filesystemWriteLimitBytes: 67108864,
  filesystemEntryLimit: 4096,
  wallTimeLimitMs: 6e4
});
function resolveResourcePolicy(value) {
  const policy = {
    ...DEFAULT_RESOURCE_POLICY,
    ...value
  };
  assertSafePositive("instructionBudget", policy.instructionBudget, Number.MAX_SAFE_INTEGER);
  assertSafePositive("logicalTimeLimitMs", policy.logicalTimeLimitMs, MAX_LOGICAL_TIME_LIMIT_MS);
  assertSafePositive("memoryLimitBytes", policy.memoryLimitBytes, MAX_MEMORY_LIMIT_BYTES);
  assertSafePositive("outputLimitBytes", policy.outputLimitBytes, 67108864);
  assertSafePositive("filesystemWriteLimitBytes", policy.filesystemWriteLimitBytes, 536870912);
  assertSafePositive("filesystemEntryLimit", policy.filesystemEntryLimit, 65536);
  assertSafePositive("wallTimeLimitMs", policy.wallTimeLimitMs, MAX_WALL_TIME_LIMIT_MS);
  if (policy.memoryLimitBytes % 65536 !== 0) throw new RangeError("memoryLimitBytes must be a multiple of the 64 KiB WebAssembly page size.");
  return policy;
}
function assertSafePositive(name, value, maximum) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new RangeError(`${name} must be a positive safe integer no greater than ${maximum}.`);
}
var CLANG_VERSION = "22.0.0-git20542-10";
var CLANG_PACKAGE = `wasm-oj/clang@${CLANG_VERSION}`;
var CLANG_PACKAGE_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.webc.gz.bin`;
var CLANG_CC1_PINS_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.cc1-pins.json`;
var CLANG_MANIFEST_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.manifest.json`;
var CLANG_LIBCXX_PCH_MANIFEST_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.libcxx-pch.json`;
var CLANG_LIBCXX_PCH_DEBUG_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.cpp-debug.pch.gz.bin`;
var CLANG_LIBCXX_PCH_RELEASE_ASSET_PATH = `/toolchains/clang-${CLANG_VERSION}.cpp-release.pch.gz.bin`;
var CLANG_COMPRESSED_PACKAGE_SHA256 = "7f10d90b8e52b270f04874641a1d0bf9e94e85b4f6c7573a774cebbc6d32552a";
var CLANG_PACKAGE_SHA256 = "21ded33b9c6d4e1aaad5528c940bdaf6c3e84be77ea8f522f018ca7289a2a224";
var CLANG_CC1_PINS_SHA256 = "895eee17c63b1112c84adcc4ddbcb38e0c18e53bff15f50a8689b9b82d87b1ff";
var CLANG_MANIFEST_SHA256 = "6382dcdfb6a2da49032a0e08da3b1fb490eb24432be85c3c12e3e871a5065273";
var CLANG_LIBCXX_PCH_MANIFEST_SHA256 = "9bbe41d77c786f1c36169369c909268530b05726e1581683f6edd9a2983eebd0";
var CLANG_LIBCXX_PCH = Object.freeze({
  "cpp-debug": Object.freeze({
    path: CLANG_LIBCXX_PCH_DEBUG_ASSET_PATH,
    sha256: "c420c4643c48826643e75585d5bfdc281f11883d4bda28b283e3c706f3046b3a",
    compressedSha256: "a3811351bae3289caf096f2d4bb6d2ee5db84b97e05514e87190d36b65c500cf"
  }),
  "cpp-release": Object.freeze({
    path: CLANG_LIBCXX_PCH_RELEASE_ASSET_PATH,
    sha256: "c4b2132cc6d698e97dd1386431fdb54faaaf38b35b2528c7bc854f860d1f64b1",
    compressedSha256: "ef004fc05ec50af697a37f7c9c814bf62e9676d0de162d6ac35305533939f93f"
  })
});
var PYTHON_VERSION = "3.14.7";
var PYTHON_PACKAGE_SHA256 = "a42c98f5f00582638c8e445440c506bbf94d5e55b3415d1f8d82d11c56cd4b56";
var PYTHON_PACKAGE = `${`wasm-oj/cpython@${PYTHON_VERSION}`}#sha256:${PYTHON_PACKAGE_SHA256}`;
var PYTHON_PACKAGE_ASSET_PATH = `/toolchains/python-${PYTHON_VERSION}-wasip1.webc.gz.bin`;
var PYTHON_PACKAGE_MANIFEST_ASSET_PATH = `/toolchains/python-${PYTHON_VERSION}-wasip1.manifest.json`;
var PYTHON_COMPRESSED_PACKAGE_SHA256 = "10027f0e32c77dfa0ce1c413b6cb27307d6744fe5e18e6da8cea738bd020260c";
var PYTHON_PACKAGE_MANIFEST_SHA256 = "53a24b258363a8494af164121111a34b49c85fa0e054627fe131feba6f359cd5";
var PYTHON_RUNTIME_FILES_ARCHIVE_SHA256 = "c1acac884af1c86833db5b65f8cc0a2304fce74dea0a05d9b40bde0a4e3e7c0e";
var QUICKJS_VERSION = "0.15.1";
var QUICKJS_PACKAGE = `wasm-oj/quickjs-ng@${QUICKJS_VERSION}`;
var QUICKJS_ASSET_PATH = `/toolchains/quickjs-${QUICKJS_VERSION}.wasm.gz.bin`;
var QUICKJS_ASSET_SHA256 = "dc6e02e8610269e61b341331661515616451cec929fd534fa96d1c4f47fbcc9a";
var TYPESCRIPT_VERSION = "7.0.2";
var TYPESCRIPT_ASSET_PATH = `/toolchains/typescript-${TYPESCRIPT_VERSION}.wasm.gz.bin`;
var TYPESCRIPT_ASSET_SHA256 = "29c6ee0e46151e2644049ae96162b1b1d46dcb13310e2a928114bb9030c3ea92";
var RUST_VERSION = "1.91.1-dev";
var RUST_PACKAGE_ASSET_PATH = `/toolchains/rust-${RUST_VERSION}.webc.gz.bin`;
var RUST_PACKAGE_MANIFEST_ASSET_PATH = `/toolchains/rust-${RUST_VERSION}.manifest.json`;
var RUST_COMPRESSED_PACKAGE_SHA256 = "cfbdadc67be1315e735aa55bdf8a5a0d00171982a023fefcf7ba586127753887";
var RUST_PACKAGE_SHA256 = "765de8d68d03078e79f69f49dec0dcab1ff96fe3bbe5e9eafebb2ce61a39d3ee";
var RUST_PACKAGE_MANIFEST_SHA256 = "d5bbdca994e61888679c5738cb9420649c0854ed0eb5d65468bc67d5d550bce1";
var GO_VERSION = "1.26.5";
var GO_PACKAGE_ASSET_PATH = `/toolchains/go-${GO_VERSION}-wasip1.webc.gz.bin`;
var GO_PACKAGE_MANIFEST_ASSET_PATH = `/toolchains/go-${GO_VERSION}-wasip1.manifest.json`;
var GO_STANDARD_LIBRARY_ASSET_PATH = `/toolchains/go-${GO_VERSION}-wasip1.stdlib.gz.bin`;
var GO_COMPRESSED_PACKAGE_SHA256 = "70a7e359884b09b2e1a622d6ac5cd6e31c334aab519e6dd80dff5e040a9e09e4";
var GO_PACKAGE_SHA256 = "c3a97934b6a83fefdea5c31f99141f70f76189eedc9ec0fa9ccd41302e50963b";
var GO_PACKAGE_MANIFEST_SHA256 = "5d784e9ca640b9525e84b598c0beb97ca110ae908568ca45f6441a441d99a262";
var GO_COMPRESSED_STANDARD_LIBRARY_SHA256 = "aeffc384fdc624544f174ba5fc3c22395717fdbc3c4387d677d20855b6be80d8";
var GO_STANDARD_LIBRARY_SHA256 = "e1ec64b08efd02b35b7ffdaf3970875aaae98325fa4795eafca94ebae2d0d192";
var GO_COMPILER_SHA256 = "9e557f5b86961fd604217d7521461c5d2b7322e383fa30dead5669b77db12201";
var GO_LINKER_SHA256 = "2eefca10af935a307ab7946447146bd30e0ea0fb5460be54dc1c55844d155580";
var JAVA_VERSION = "teavm-0.13.1-wasmgc-wasip1";
var JAVA_COMPILER_PACKAGE = `wasm-oj/java-teavm@${JAVA_VERSION}`;
var JAVA_COMPILER_ASSET_PATH = "/toolchains/java-teavm-0.13.1.compiler.wasm";
var JAVA_COMPILE_CLASSLIB_ASSET_PATH = "/toolchains/java-teavm-0.13.1.compile-classlib.bin";
var JAVA_RUNTIME_CLASSLIB_ASSET_PATH = "/toolchains/java-teavm-0.13.1.runtime-classlib.bin";
var JAVA_COMPILER_SHA256 = "8c37bce1c6fceeaffeffe93e10834309b67c8b6fb58c6f8a24547afe8be67f5d";
var JAVA_COMPILE_CLASSLIB_SHA256 = "738a82b7d7e7ff8d98b07bb076785da7035847a166afb8446fd150c4efce6103";
var JAVA_RUNTIME_CLASSLIB_SHA256 = "0ed234b66cdde19cb29e6c2865a3636d792d3cf72f102e73a7b3fdede80b79e6";
var PINNED_TOOLCHAIN_ASSET_SHA256 = Object.freeze({
  [CLANG_PACKAGE_ASSET_PATH]: CLANG_COMPRESSED_PACKAGE_SHA256,
  [CLANG_CC1_PINS_ASSET_PATH]: CLANG_CC1_PINS_SHA256,
  [CLANG_MANIFEST_ASSET_PATH]: CLANG_MANIFEST_SHA256,
  [CLANG_LIBCXX_PCH_MANIFEST_ASSET_PATH]: CLANG_LIBCXX_PCH_MANIFEST_SHA256,
  [CLANG_LIBCXX_PCH_DEBUG_ASSET_PATH]: CLANG_LIBCXX_PCH["cpp-debug"].compressedSha256,
  [CLANG_LIBCXX_PCH_RELEASE_ASSET_PATH]: CLANG_LIBCXX_PCH["cpp-release"].compressedSha256,
  [PYTHON_PACKAGE_ASSET_PATH]: PYTHON_COMPRESSED_PACKAGE_SHA256,
  [PYTHON_PACKAGE_MANIFEST_ASSET_PATH]: PYTHON_PACKAGE_MANIFEST_SHA256,
  [QUICKJS_ASSET_PATH]: QUICKJS_ASSET_SHA256,
  [TYPESCRIPT_ASSET_PATH]: TYPESCRIPT_ASSET_SHA256,
  [RUST_PACKAGE_ASSET_PATH]: RUST_COMPRESSED_PACKAGE_SHA256,
  [RUST_PACKAGE_MANIFEST_ASSET_PATH]: RUST_PACKAGE_MANIFEST_SHA256,
  [GO_PACKAGE_ASSET_PATH]: GO_COMPRESSED_PACKAGE_SHA256,
  [GO_PACKAGE_MANIFEST_ASSET_PATH]: GO_PACKAGE_MANIFEST_SHA256,
  [GO_STANDARD_LIBRARY_ASSET_PATH]: GO_COMPRESSED_STANDARD_LIBRARY_SHA256,
  [JAVA_COMPILER_ASSET_PATH]: JAVA_COMPILER_SHA256,
  [JAVA_COMPILE_CLASSLIB_ASSET_PATH]: JAVA_COMPILE_CLASSLIB_SHA256,
  [JAVA_RUNTIME_CLASSLIB_ASSET_PATH]: JAVA_RUNTIME_CLASSLIB_SHA256
});
var TOOLCHAIN_CONTENT_SHA256 = Object.freeze({
  c: Object.freeze([
    CLANG_COMPRESSED_PACKAGE_SHA256,
    CLANG_PACKAGE_SHA256,
    CLANG_CC1_PINS_SHA256,
    CLANG_MANIFEST_SHA256
  ]),
  cpp: Object.freeze([
    CLANG_COMPRESSED_PACKAGE_SHA256,
    CLANG_PACKAGE_SHA256,
    CLANG_CC1_PINS_SHA256,
    CLANG_MANIFEST_SHA256
  ]),
  rust: Object.freeze([
    RUST_COMPRESSED_PACKAGE_SHA256,
    RUST_PACKAGE_SHA256,
    RUST_PACKAGE_MANIFEST_SHA256
  ]),
  python: Object.freeze([
    PYTHON_COMPRESSED_PACKAGE_SHA256,
    PYTHON_PACKAGE_SHA256,
    PYTHON_PACKAGE_MANIFEST_SHA256,
    PYTHON_RUNTIME_FILES_ARCHIVE_SHA256
  ]),
  javascript: Object.freeze([TYPESCRIPT_ASSET_SHA256, QUICKJS_ASSET_SHA256]),
  typescript: Object.freeze([TYPESCRIPT_ASSET_SHA256, QUICKJS_ASSET_SHA256]),
  go: Object.freeze([
    GO_COMPRESSED_PACKAGE_SHA256,
    GO_PACKAGE_SHA256,
    GO_PACKAGE_MANIFEST_SHA256,
    GO_COMPRESSED_STANDARD_LIBRARY_SHA256,
    GO_STANDARD_LIBRARY_SHA256,
    GO_COMPILER_SHA256,
    GO_LINKER_SHA256
  ])
});
function toolchainContentIdentity(language) {
  if (language === "java") return [
    JAVA_COMPILER_SHA256,
    JAVA_COMPILE_CLASSLIB_SHA256,
    JAVA_RUNTIME_CLASSLIB_SHA256
  ].join(".");
  if (!isBuiltinLanguage(language)) throw new Error(`WASM-OJ has no built-in toolchain for '${language}'.`);
  return TOOLCHAIN_CONTENT_SHA256[language].join(".");
}
function freezeToolchain(definition) {
  return Object.freeze({
    ...definition,
    compilerPackages: Object.freeze([...definition.compilerPackages]),
    targets: Object.freeze([...definition.targets])
  });
}
var TOOLCHAINS = Object.freeze({
  c: freezeToolchain({
    language: "c",
    label: "Clang 22",
    artifact: "wasm",
    compilerPackages: [CLANG_PACKAGE],
    targets: ["wasip1", "wasix"],
    version: CLANG_VERSION,
    note: "Native wasip1 module via Clang and LLD; directly executable by WASI and WASIX runtimes."
  }),
  cpp: freezeToolchain({
    language: "cpp",
    label: "Clang++ 22 (C++20)",
    artifact: "wasm",
    compilerPackages: [CLANG_PACKAGE],
    targets: ["wasip1", "wasix"],
    version: CLANG_VERSION,
    note: "C++20/libc++ wasip1 module; directly executable by WASI and WASIX runtimes."
  }),
  rust: freezeToolchain({
    language: "rust",
    label: `Rust ${RUST_VERSION}`,
    artifact: "wasm",
    compilerPackages: [`rustc@${RUST_VERSION}#sha256:${RUST_PACKAGE_SHA256}`],
    targets: ["wasip1"],
    version: RUST_VERSION,
    note: "Real rustc, its matching standard library, and a fresh deterministic wasm-ld stage execute as one pinned WebC under Wasmer."
  }),
  python: freezeToolchain({
    language: "python",
    label: `CPython ${PYTHON_VERSION}`,
    artifact: "runtime-bundle",
    compilerPackages: [PYTHON_PACKAGE],
    runtimePackage: PYTHON_PACKAGE,
    targets: ["wasip1"],
    version: PYTHON_VERSION,
    note: "Python source files executed by the source-built CPython wasm32-wasip1 interpreter and standard library."
  }),
  javascript: freezeToolchain({
    language: "javascript",
    label: "QuickJS-ng",
    artifact: "runtime-bundle",
    compilerPackages: [`typescript@${TYPESCRIPT_VERSION}-wasi`],
    runtimePackage: QUICKJS_PACKAGE,
    targets: ["wasip1"],
    version: QUICKJS_VERSION,
    note: "JavaScript checked by TypeScript/WASI, then executed by the bundled QuickJS-ng/WASI runtime."
  }),
  typescript: freezeToolchain({
    language: "typescript",
    label: "TypeScript + QuickJS-ng",
    artifact: "runtime-bundle",
    compilerPackages: [`typescript@${TYPESCRIPT_VERSION}-wasi`],
    runtimePackage: QUICKJS_PACKAGE,
    targets: ["wasip1"],
    version: TYPESCRIPT_VERSION,
    note: "The native TypeScript compiler and QuickJS-ng runtime both execute as local WASI modules."
  }),
  go: freezeToolchain({
    language: "go",
    label: `Go ${GO_VERSION}`,
    artifact: "wasm",
    compilerPackages: [`go@${GO_VERSION}#sha256:${GO_PACKAGE_SHA256}`],
    targets: ["wasip1"],
    version: GO_VERSION,
    note: "The standard Go compiler, linker, and pinned wasip1 standard library execute locally as one WebC under Wasmer."
  })
});
function toolchainCacheIdentity(language) {
  if (language === "java") return {
    wasmOjContract: WASM_OJ_CONTRACT_VERSION,
    version: JAVA_VERSION,
    compilerPackages: [JAVA_COMPILER_PACKAGE],
    contentSha256: toolchainContentIdentity(language).split(".")
  };
  if (!isBuiltinLanguage(language)) throw new Error(`WASM-OJ has no built-in toolchain for '${language}'.`);
  const toolchain = TOOLCHAINS[language];
  return {
    wasmOjContract: WASM_OJ_CONTRACT_VERSION,
    version: toolchain.version,
    compilerPackages: [...toolchain.compilerPackages],
    runtimePackage: toolchain.runtimePackage,
    contentSha256: [...TOOLCHAIN_CONTENT_SHA256[language]]
  };
}
function browserToolchainAssetPaths(selection) {
  const { language, optimization } = selection;
  switch (language) {
    case "c":
      return Object.freeze([CLANG_PACKAGE_ASSET_PATH, CLANG_CC1_PINS_ASSET_PATH]);
    case "cpp":
      return Object.freeze([
        CLANG_PACKAGE_ASSET_PATH,
        CLANG_CC1_PINS_ASSET_PATH,
        ...selection.libcxxPrecompiledHeader ? [CLANG_LIBCXX_PCH_MANIFEST_ASSET_PATH, CLANG_LIBCXX_PCH[`cpp-${optimization}`].path] : []
      ]);
    case "rust":
      return Object.freeze([RUST_PACKAGE_ASSET_PATH, RUST_PACKAGE_MANIFEST_ASSET_PATH]);
    case "go":
      return Object.freeze([
        GO_PACKAGE_ASSET_PATH,
        GO_PACKAGE_MANIFEST_ASSET_PATH,
        GO_STANDARD_LIBRARY_ASSET_PATH
      ]);
    case "java":
      return Object.freeze([
        JAVA_COMPILER_ASSET_PATH,
        JAVA_COMPILE_CLASSLIB_ASSET_PATH,
        JAVA_RUNTIME_CLASSLIB_ASSET_PATH
      ]);
    case "python":
      return Object.freeze([PYTHON_PACKAGE_ASSET_PATH]);
    case "javascript":
      return Object.freeze([QUICKJS_ASSET_PATH]);
    case "typescript":
      return Object.freeze([TYPESCRIPT_ASSET_PATH, QUICKJS_ASSET_PATH]);
    default:
      throw new Error(`WASM-OJ has no built-in toolchain for '${language}'.`);
  }
}
function toolchainPackageIdentities(language) {
  if (language === "java") return [JAVA_COMPILER_PACKAGE];
  if (!isBuiltinLanguage(language)) throw new Error(`WASM-OJ has no built-in toolchain for '${language}'.`);
  const toolchain = TOOLCHAINS[language];
  return [.../* @__PURE__ */ new Set([...toolchain.compilerPackages, ...toolchain.runtimePackage ? [toolchain.runtimePackage] : []])];
}
function extensionLanguage(path) {
  return {
    c: "c",
    h: "c",
    cc: "cpp",
    cpp: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    rs: "rust",
    py: "python",
    js: "javascript",
    ts: "typescript",
    go: "go",
    java: "java"
  }[path.slice(path.lastIndexOf(".") + 1).toLowerCase()];
}
async function sha256Hex$1(value) {
  const source = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const bytes = new Uint8Array(source.byteLength);
  bytes.set(source);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
var WASM_OJ_RUNTIME_COMPONENTS = Object.freeze({
  runtimeCoreWasmSha256: "077aa936a3382a242eee7222fc17369769cb5ad265303d730ffc45ee192367e9",
  runtimeSourceRootSha256: "c65b3bbcad41359f86b8f1d1315af8f079b44f0e9084ace0d6d50c0ec418415b",
  wasmerNativeVersion: "7.2.1",
  wasmerSdkVersion: "0.10.0",
  wasmerSdkWasmSha256: "49a6646209f5ab5e7c737eac33407d87d9a9959ac83e5ecaaab9261b2323589e",
  wasmerWasixVersion: "0.702.1"
});
var WASM_OJ_RUNTIME_IDENTITY_SHA256 = "47684bee57aafd163b18a787fa16eed33cab3ec3c0005c3c46bb4f1803ffc835";
function coordinates(language, target, optimization) {
  assertLanguageIdentifier(language);
  return [
    "wasm-oj-cost",
    `contract-${WASM_OJ_CONTRACT_VERSION}`,
    encodeURIComponent(language),
    target,
    optimization
  ];
}
function costProfileId(language, target, optimization, downstreamToolchainContent) {
  const content = isBuiltinLanguage(language) ? toolchainContentIdentity(language) : downstreamToolchainContent;
  if (!content || !/^[A-Za-z0-9._-]+$/.test(content)) throw new Error(isBuiltinLanguage(language) ? `WASM-OJ toolchain content identity is invalid for '${language}'.` : `Downstream language '${language}' requires an explicit content identity using letters, digits, '.', '_' or '-'.`);
  return [
    ...coordinates(language, target, optimization),
    `content-${content}`,
    `runtime-${WASM_OJ_RUNTIME_IDENTITY_SHA256}`,
    WEIGHTED_METER_MODEL
  ].join(":");
}
function isCostProfileFor(profile, language, target, optimization) {
  const prefix = `${coordinates(language, target, optimization).join(":")}:content-`;
  const suffix = `:runtime-${WASM_OJ_RUNTIME_IDENTITY_SHA256}:${WEIGHTED_METER_MODEL}`;
  if (!profile.startsWith(prefix) || !profile.endsWith(suffix)) return false;
  const content = profile.slice(prefix.length, -suffix.length);
  return Boolean(content) && /^[A-Za-z0-9._-]+$/.test(content);
}
var JAVA_EMPTY_PROGRAM_BASELINE_COST = Object.freeze({
  debug: 2907,
  release: 2419
});
var javaContent = toolchainContentIdentity("java");
var DEFAULT_COST_BASELINES = Object.freeze({
  [costProfileId("java", "wasip1", "debug", javaContent)]: JAVA_EMPTY_PROGRAM_BASELINE_COST.debug,
  [costProfileId("java", "wasip1", "release", javaContent)]: JAVA_EMPTY_PROGRAM_BASELINE_COST.release
});
var CostBaselineRegistry = class {
  baselines = /* @__PURE__ */ new Map();
  sealed = false;
  constructor(entries = {}) {
    for (const [profile, baseline] of Object.entries(entries)) this.register(profile, baseline);
  }
  register(profile, baseline) {
    if (this.sealed) throw new Error("CostBaselineRegistry is sealed after its first lookup.");
    if (typeof profile !== "string" || !profile || profile !== profile.trim() || profile.length > 16384) throw new Error("Cost profile IDs must be non-empty, trimmed strings of at most 16384 characters.");
    if (!Number.isSafeInteger(baseline) || baseline < 0) throw new RangeError(`Cost baseline '${profile}' must be a non-negative safe integer.`);
    if (this.baselines.has(profile)) throw new Error(`Cost profile '${profile}' is already registered.`);
    this.baselines.set(profile, baseline);
  }
  baseline(profile) {
    this.sealed = true;
    if (typeof profile !== "string" || profile.length === 0) throw new Error("Cost profile is required.");
    return this.baselines.get(profile) ?? 0;
  }
};
function createDefaultCostBaselineRegistry() {
  return new CostBaselineRegistry(DEFAULT_COST_BASELINES);
}
function createExtendedCostBaselineRegistry(additional = {}) {
  return new CostBaselineRegistry({
    ...DEFAULT_COST_BASELINES,
    ...additional
  });
}
function resolveCostBudget(profile, netInstructionBudget, registry = createDefaultCostBaselineRegistry()) {
  if (!Number.isSafeInteger(netInstructionBudget) || netInstructionBudget < 1) throw new RangeError("Net instruction budget must be a positive safe integer.");
  const baselineCost = registry.baseline(profile);
  const rawInstructionBudget = baselineCost + netInstructionBudget;
  if (!Number.isSafeInteger(rawInstructionBudget)) throw new RangeError(`Raw instruction budget overflows for cost profile '${profile}'.`);
  return {
    profile,
    baselineCost,
    netInstructionBudget,
    rawInstructionBudget
  };
}
function resolveArtifactCostBudget(artifact, netInstructionBudget, registry = createDefaultCostBaselineRegistry()) {
  if (!(isBuiltinLanguage(artifact.language) ? artifact.costProfile === costProfileId(artifact.language, artifact.target, artifact.optimization) : isCostProfileFor(artifact.costProfile, artifact.language, artifact.target, artifact.optimization))) throw new Error(`Artifact cost profile '${artifact.costProfile}' does not match ${artifact.language}/${artifact.target}/${artifact.optimization}.`);
  const budget = resolveCostBudget(artifact.costProfile, netInstructionBudget, registry);
  if (artifact.language === "java" && budget.baselineCost === 0) throw new Error(`Java cost profile '${artifact.costProfile}' has no calibrated empty-program baseline.`);
  return budget;
}
function unavailableExecutionMetrics(budget, costModel) {
  if (costModel !== "weighted") throw new Error(`Unsupported cost model '${String(costModel)}'.`);
  return {
    cost: null,
    rawCost: null,
    baselineCost: budget.baselineCost,
    costProfile: budget.profile,
    costModel,
    operations: null,
    memoryBytes: null,
    logicalTimeNs: null,
    filesystemBytes: null,
    filesystemEntries: null,
    stdoutBytes: null,
    stderrBytes: null
  };
}
var PROJECT_SOURCE_LIMITS = Object.freeze({
  files: 256,
  bytesPerFile: 4194304,
  totalBytes: 16777216
});
var UTF8_ENCODER$1 = new TextEncoder();
function compareCanonicalPaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function assertSafeRelativePath(path, label = "Project path") {
  if (typeof path !== "string" || !path || path !== path.trim() || path.length > 4096) throw new Error(`${label} must be a non-empty, trimmed string of at most 4096 characters.`);
  if (path.startsWith("/") || path.includes("\\") || path.includes("\0") || path.split("/").some((segment) => !segment || segment === "." || segment === "..")) throw new Error(`${label} '${path}' must be a normalized relative path that cannot escape the project.`);
}
function canonicalProjectFiles(files) {
  if (!Array.isArray(files) || files.length === 0) throw new Error("A project must contain at least one source file.");
  if (files.length > PROJECT_SOURCE_LIMITS.files) throw new Error(`A project cannot contain more than ${PROJECT_SOURCE_LIMITS.files} source files.`);
  const seen = /* @__PURE__ */ new Set();
  let totalBytes = 0;
  return files.map((file, index) => {
    if (!file || typeof file !== "object") throw new Error(`Project file ${index} is invalid.`);
    assertSafeRelativePath(file.path, `Project file ${index} path`);
    assertLanguageIdentifier(file.language);
    if (typeof file.content !== "string") throw new Error(`Project file '${file.path}' content must be a string.`);
    if (file.content.length > PROJECT_SOURCE_LIMITS.bytesPerFile) throw new Error(`Project file '${file.path}' exceeds the ${PROJECT_SOURCE_LIMITS.bytesPerFile} byte source limit.`);
    const contentBytes = UTF8_ENCODER$1.encode(file.content).byteLength;
    if (contentBytes > PROJECT_SOURCE_LIMITS.bytesPerFile) throw new Error(`Project file '${file.path}' exceeds the ${PROJECT_SOURCE_LIMITS.bytesPerFile} byte source limit.`);
    totalBytes += contentBytes;
    if (totalBytes > PROJECT_SOURCE_LIMITS.totalBytes) throw new Error(`Project sources exceed the ${PROJECT_SOURCE_LIMITS.totalBytes} byte total limit.`);
    if (seen.has(file.path)) throw new Error(`Duplicate project path '${file.path}'.`);
    seen.add(file.path);
    return {
      path: file.path,
      language: file.language,
      content: file.content
    };
  }).sort((left, right) => compareCanonicalPaths(left.path, right.path));
}
function canonicalFileEntries(files) {
  if (!files || typeof files !== "object" || Array.isArray(files)) throw new Error("Runtime bundle files must be a record.");
  return Object.entries(files).map(([path, contents]) => {
    assertSafeRelativePath(path, "Runtime bundle path");
    return [path, contents];
  }).sort(([left], [right]) => compareCanonicalPaths(left, right));
}
var MIB = 1048576;
var SHA256$3 = /^[0-9a-f]{64}$/;
var DEPENDENCY_RESOLUTION_LIMITS = Object.freeze({
  requirements: 128,
  sourceFiles: 128,
  sourceTextBytes: 8 * MIB,
  hosts: 32,
  roots: 512,
  packages: 512,
  referencesPerPackage: 512,
  concurrency: 16,
  metadataBytes: 8 * MIB,
  packageBytes: 256 * MIB,
  totalDownloadBytes: 512 * MIB,
  archiveFiles: 16384,
  unpackedBytes: 512 * MIB
});
var DEPENDENCY_BUILD_LIMITS = Object.freeze({
  packages: DEPENDENCY_RESOLUTION_LIMITS.packages,
  filesPerPackage: DEPENDENCY_RESOLUTION_LIMITS.archiveFiles,
  bytesPerFile: 64 * MIB,
  totalBytes: DEPENDENCY_RESOLUTION_LIMITS.unpackedBytes
});
function assertBoundedCount(count, maximum, label) {
  if (!Number.isSafeInteger(count) || count < 0 || count > maximum) throw new RangeError(`${label} exceeds the ${maximum}-item limit.`);
}
function createDependencyLock(manifestSha256, roots, packages) {
  requireSha256$2(manifestSha256, "Dependency manifest");
  assertBoundedCount(roots.length, DEPENDENCY_RESOLUTION_LIMITS.roots, "Dependency roots");
  assertBoundedCount(packages.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "Dependency packages");
  const lock = {
    schema: WASM_OJ_SCHEMAS.dependencyLock,
    wasmOjContract: WASM_OJ_CONTRACT_VERSION,
    manifestSha256,
    roots: canonicalStrings(roots, "dependency root"),
    packages: packages.map(canonicalPackage).sort((left, right) => left.id.localeCompare(right.id))
  };
  assertValidDependencyLock(lock);
  return lock;
}
function assertValidDependencyLock(value) {
  if (!isRecord$4(value)) throw new TypeError("Dependency lock must be an object.");
  if (value.schema !== WASM_OJ_SCHEMAS.dependencyLock || value.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw new Error("Dependency lock does not use the active WASM-OJ contract.");
  if (!Array.isArray(value.roots) || !Array.isArray(value.packages)) throw new TypeError("Dependency lock roots and packages must be arrays.");
  assertBoundedCount(value.roots.length, DEPENDENCY_RESOLUTION_LIMITS.roots, "Dependency lock roots");
  assertBoundedCount(value.packages.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "Dependency lock packages");
  requireSha256$2(value.manifestSha256, "Dependency manifest");
  const roots = canonicalStrings(value.roots, "dependency root");
  const packages = value.packages.map(canonicalPackage);
  assertSortedUnique(roots, "dependency roots");
  assertSortedUnique(packages.map((item) => item.id), "dependency packages");
  const ids = new Set(packages.map((item) => item.id));
  for (const root of roots) if (!ids.has(root)) throw new Error(`Dependency root '${root}' is not present in the package graph.`);
  for (const item of packages) for (const dependency of item.dependencies) if (!ids.has(dependency)) throw new Error(`Dependency package '${item.id}' refers to missing package '${dependency}'.`);
}
async function dependencyLockSha256(lock) {
  assertValidDependencyLock(lock);
  return sha256Hex$1(JSON.stringify(lock));
}
async function dependencyManifestSha256(manifest) {
  assertValidDependencyManifest(manifest);
  const requirements = manifest.requirements.map((requirement) => ({
    ecosystem: requirement.ecosystem,
    name: requirement.name,
    requirement: requirement.requirement,
    features: [...requirement.features ?? []]
  })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const sourceFiles = [...manifest.sourceFiles ?? []].map((file) => ({ ...file })).sort((left, right) => `${left.ecosystem}:${left.role}:${left.path}`.localeCompare(`${right.ecosystem}:${right.role}:${right.path}`));
  return sha256Hex$1(JSON.stringify({
    requirements,
    sourceFiles
  }));
}
function assertValidDependencyManifest(value) {
  if (!isRecord$4(value) || !Array.isArray(value.requirements)) throw new TypeError("Dependency manifest requirements must be an array.");
  assertBoundedCount(value.requirements.length, DEPENDENCY_RESOLUTION_LIMITS.requirements, "Dependency requirements");
  const requirementIds = /* @__PURE__ */ new Set();
  for (const requirement of value.requirements) {
    assertDependencyRequirement(requirement);
    const identity = JSON.stringify(requirement);
    if (requirementIds.has(identity)) throw new Error(`Duplicate dependency requirement '${requirement.name}'.`);
    requirementIds.add(identity);
  }
  if (value.sourceFiles !== void 0 && !Array.isArray(value.sourceFiles)) throw new TypeError("Dependency source files must be an array.");
  const sourceFiles = value.sourceFiles ?? [];
  assertBoundedCount(sourceFiles.length, DEPENDENCY_RESOLUTION_LIMITS.sourceFiles, "Dependency source files");
  const sourceIds = /* @__PURE__ */ new Set();
  const encoder2 = new TextEncoder();
  let sourceTextBytes = 0;
  for (const candidate of sourceFiles) {
    if (!isRecord$4(candidate) || !DEPENDENCY_ECOSYSTEMS.includes(candidate.ecosystem) || !"manifest lockfile source".split(" ").includes(candidate.role)) throw new Error("Dependency source files require a supported ecosystem and role.");
    assertSafeRelativePath(candidate.path, "Dependency source path");
    if (typeof candidate.contents !== "string" || candidate.contents.includes("\0")) throw new Error(`Dependency source file '${String(candidate.path)}' must contain NUL-free text.`);
    sourceTextBytes += encoder2.encode(candidate.contents).byteLength;
    if (sourceTextBytes > DEPENDENCY_RESOLUTION_LIMITS.sourceTextBytes) throw new RangeError(`Dependency source text exceeds the ${DEPENDENCY_RESOLUTION_LIMITS.sourceTextBytes}-byte aggregate limit.`);
    const identity = `${candidate.ecosystem}:${candidate.role}:${candidate.path}`;
    if (sourceIds.has(identity)) throw new Error(`Duplicate dependency source file '${candidate.path}'.`);
    sourceIds.add(identity);
  }
}
function assertDependencyRequirement(value) {
  if (!isRecord$4(value)) throw new TypeError("Dependency requirement must be an object.");
  if (!DEPENDENCY_ECOSYSTEMS.includes(value.ecosystem)) throw new Error(`Unsupported dependency ecosystem '${String(value.ecosystem)}'.`);
  canonicalText(value.name, "dependency name", 512);
  canonicalText(value.requirement, "dependency requirement", 2048);
  if (value.features !== void 0) {
    if (!Array.isArray(value.features)) throw new TypeError("Dependency features must be an array.");
    assertBoundedCount(value.features.length, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, "Dependency features");
    assertSortedUnique(canonicalStrings(value.features, "dependency feature"), "dependency features");
  }
}
function assertValidDependencyBuildBundle(value) {
  if (!isRecord$4(value)) throw new TypeError("Dependency build bundle must be an object.");
  assertValidDependencyLock(value.lock);
  requireSha256$2(value.lockSha256, "Dependency build lock");
  if (!Array.isArray(value.packages) || value.packages.length !== value.lock.packages.length) throw new Error("Dependency build packages must exactly match the dependency lock.");
  let totalBytes = 0;
  for (const [index, candidate] of value.packages.entries()) {
    if (!isRecord$4(candidate) || !isRecord$4(candidate.package) || candidate.package.id !== value.lock.packages[index]?.id) throw new Error("Dependency build packages must use canonical lock order.");
    requireSha256$2(candidate.filesSha256, `Dependency package '${candidate.package.id}' file tree`);
    const files = canonicalDependencyFiles(candidate.files, candidate.package.id, false);
    totalBytes += Object.values(files).reduce((sum, bytes) => sum + bytes.byteLength, 0);
  }
  if (totalBytes > DEPENDENCY_BUILD_LIMITS.totalBytes) throw new RangeError(`Dependency build exceeds ${DEPENDENCY_BUILD_LIMITS.totalBytes} extracted bytes.`);
}
async function verifyDependencyBuildBundle(bundle) {
  assertValidDependencyBuildBundle(bundle);
  if (await dependencyLockSha256(bundle.lock) !== bundle.lockSha256) throw new Error("Dependency build lock digest does not match its canonical lock.");
  for (const item of bundle.packages) if (await dependencyFileTreeSha256(item.files) !== item.filesSha256) throw new Error(`Dependency package '${item.package.id}' file-tree digest mismatch.`);
}
async function dependencyFileTreeSha256(files) {
  const entries = [];
  for (const [path, bytes] of Object.entries(files).sort(([left], [right]) => left.localeCompare(right))) entries.push({
    path,
    bytes: bytes.byteLength,
    sha256: await sha256Hex$1(bytes)
  });
  return sha256Hex$1(JSON.stringify(entries));
}
function canonicalDependencyFiles(value, id, clone = true) {
  if (!isRecord$4(value)) throw new TypeError(`Dependency '${id}' materializer must return a file record.`);
  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0 || entries.length > DEPENDENCY_BUILD_LIMITS.filesPerPackage) throw new RangeError(`Dependency '${id}' must contain 1-${DEPENDENCY_BUILD_LIMITS.filesPerPackage} files.`);
  const result = {};
  for (const [path, bytes] of entries) {
    assertSafeRelativePath(path, `Dependency '${id}' file path`);
    if (!(bytes instanceof Uint8Array) || bytes.byteLength > DEPENDENCY_BUILD_LIMITS.bytesPerFile) throw new RangeError(`Dependency '${id}' file '${path}' exceeds its byte limit.`);
    result[path] = clone ? bytes.slice() : bytes;
  }
  return result;
}
function canonicalPackage(value) {
  if (!isRecord$4(value)) throw new TypeError("Locked dependency package must be an object.");
  canonicalText(value.id, "dependency package ID", 2048);
  if (!DEPENDENCY_ECOSYSTEMS.includes(value.ecosystem)) throw new Error(`Unsupported dependency ecosystem '${String(value.ecosystem)}'.`);
  const ecosystem = value.ecosystem;
  canonicalText(value.name, "dependency package name", 512);
  canonicalText(value.version, "dependency package version", 512);
  canonicalText(value.source, "dependency package source", 4096);
  if (value.id !== `${ecosystem}:${value.name}@${value.version}`) throw new Error(`Dependency package ID '${value.id}' does not match its ecosystem, name, and version.`);
  requireSha256$2(value.integritySha256, `Dependency package '${value.id}'`);
  if (!Array.isArray(value.dependencies)) throw new TypeError("Package dependencies must be an array.");
  const dependencies = canonicalStrings(value.dependencies, "dependency package reference");
  assertSortedUnique(dependencies, `dependencies of '${value.id}'`);
  let features;
  if (value.features !== void 0) {
    if (!Array.isArray(value.features)) throw new TypeError("Locked package features must be an array.");
    features = canonicalStrings(value.features, "locked package feature");
    assertSortedUnique(features, `features of '${value.id}'`);
  }
  return {
    id: value.id,
    ecosystem,
    name: value.name,
    version: value.version,
    source: value.source,
    integritySha256: value.integritySha256,
    dependencies,
    ...features ? { features } : {}
  };
}
function canonicalStrings(values, label) {
  return values.map((value) => canonicalText(value, label, 4096));
}
function canonicalText(value, label, maximum) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum || value.includes("\0")) throw new Error(`${label} must be a non-empty, trimmed, NUL-free string of at most ${maximum} characters.`);
  return value;
}
function assertSortedUnique(values, label) {
  for (let index = 1; index < values.length; index += 1) if (values[index - 1] >= values[index]) throw new Error(`${label} must be sorted and unique.`);
}
function requireSha256$2(value, label) {
  if (typeof value !== "string" || !SHA256$3.test(value)) throw new Error(`${label} SHA-256 must be lowercase hexadecimal.`);
}
function isRecord$4(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var PROJECT_KEYS = Object.freeze([
  "id",
  "name",
  "files",
  "config",
  "activeFile",
  "updatedAt"
]);
var PROJECT_KEYS_WITH_DEPENDENCIES = Object.freeze([...PROJECT_KEYS, "dependencies"]);
var PROJECT_FILE_KEYS = Object.freeze([
  "path",
  "language",
  "content"
]);
var PROJECT_CONFIG_KEYS = Object.freeze([
  "language",
  "target",
  "optimization",
  "entry",
  "args",
  "stdin",
  "env",
  "determinism",
  "resources"
]);
var DETERMINISM_KEYS = Object.freeze([
  "randomSeed",
  "realtimeEpochMs",
  "clockStepNs"
]);
var RESOURCE_KEYS = Object.freeze([
  "instructionBudget",
  "logicalTimeLimitMs",
  "memoryLimitBytes",
  "outputLimitBytes",
  "filesystemWriteLimitBytes",
  "filesystemEntryLimit",
  "wallTimeLimitMs"
]);
function plainDataRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a plain data object.`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new Error(`${label} must be a plain data object.`);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") throw new Error(`${label} cannot contain symbol properties.`);
    const descriptor2 = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor2?.enumerable || !("value" in descriptor2)) throw new Error(`${label}.${key} must be an enumerable data property.`);
  }
  return value;
}
function exactDataRecord(value, label, expectedKeys) {
  const record = plainDataRecord(value, label);
  if (Object.keys(record).length !== expectedKeys.length || expectedKeys.some((key) => !Object.hasOwn(record, key))) throw new Error(`${label} must contain exactly: ${expectedKeys.join(", ")}.`);
  return record;
}
function denseDataArray(value, label) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) throw new Error(`${label} must be a plain array.`);
  const keys = Object.keys(value);
  if (keys.length !== value.length || keys.some((key, index) => key !== String(index)) || Reflect.ownKeys(value).length !== value.length + 1) throw new Error(`${label} must be a dense array without custom properties.`);
  for (const key of keys) {
    const descriptor2 = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor2?.enumerable || !("value" in descriptor2)) throw new Error(`${label}[${key}] must be an enumerable data property.`);
  }
  return value;
}
function requiredTrimmedString$1(value, label, maximum) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum) throw new Error(`${label} must be a non-empty, trimmed string of at most ${maximum} characters.`);
}
function assertStringArray(value, label) {
  if (denseDataArray(value, label).some((entry) => typeof entry !== "string")) throw new Error(`${label} must contain only strings.`);
}
function assertEnvironment(value) {
  const environment = plainDataRecord(value, "Project environment");
  for (const [name, entry] of Object.entries(environment)) {
    if (!name || name.includes("=") || name.includes("\0")) throw new Error(`Project environment variable name '${name}' is invalid.`);
    if (typeof entry !== "string" || entry.includes("\0")) throw new Error(`Project environment variable '${name}' must be a NUL-free string.`);
  }
}
function assertProjectFiles(value) {
  const files = denseDataArray(value, "Project files");
  for (const [index, file] of files.entries()) exactDataRecord(file, `Project file ${index}`, PROJECT_FILE_KEYS);
  canonicalProjectFiles(files);
}
function assertDeterminism(value) {
  exactDataRecord(value, "Project determinism", DETERMINISM_KEYS);
  resolveDeterminism(value);
}
function assertResources(value) {
  exactDataRecord(value, "Project resources", RESOURCE_KEYS);
  resolveResourcePolicy(value);
}
function assertProjectConfig(value) {
  const config = exactDataRecord(value, "Project config", PROJECT_CONFIG_KEYS);
  assertLanguageIdentifier(config.language);
  if (config.target !== "wasip1" && config.target !== "wasix") throw new Error("Project target must be 'wasip1' or 'wasix'.");
  if (config.optimization !== "debug" && config.optimization !== "release") throw new Error("Project optimization must be 'debug' or 'release'.");
  if (isBuiltinLanguage(config.language) && !TOOLCHAINS[config.language].targets.includes(config.target)) throw new Error(`Project target '${config.target}' is unsupported for built-in language '${config.language}'.`);
  if (config.language === "java" && config.target !== "wasip1") throw new Error("Project target 'wasix' is unsupported for Java.");
  requiredTrimmedString$1(config.entry, "Project entry", 4096);
  assertStringArray(config.args, "Project arguments");
  if (typeof config.stdin !== "string") throw new Error("Project stdin must be a string.");
  assertEnvironment(config.env);
  assertDeterminism(config.determinism);
  assertResources(config.resources);
}
function assertValidProject(candidate) {
  const hasDependencies = Boolean(candidate && typeof candidate === "object" && Object.hasOwn(candidate, "dependencies"));
  const project = exactDataRecord(candidate, "Project", hasDependencies ? PROJECT_KEYS_WITH_DEPENDENCIES : PROJECT_KEYS);
  requiredTrimmedString$1(project.id, "Project id", 16384);
  requiredTrimmedString$1(project.name, "Project name", 4096);
  assertProjectFiles(project.files);
  assertProjectConfig(project.config);
  if (typeof project.activeFile !== "string") throw new Error("Project activeFile must be a string.");
  const paths = new Set(project.files.map((file) => file.path));
  if (!paths.has(project.config.entry)) throw new Error(`Project entry '${project.config.entry}' is not present in files.`);
  if (!paths.has(project.activeFile)) throw new Error(`Project activeFile '${project.activeFile}' is not present in files.`);
  if (typeof project.updatedAt !== "number" || !Number.isFinite(project.updatedAt) || project.updatedAt < 0) throw new Error("Project updatedAt must be a non-negative finite number.");
  if (hasDependencies) assertValidDependencyBuildBundle(project.dependencies);
}
var encoder$2 = new TextEncoder();
var RUNTIME_COMMANDS = Object.freeze({
  python: "python",
  javascript: "qjs",
  typescript: "qjs"
});
function requiredTrimmedString(value, label, maximum = 16384) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum) throw new Error(`${label} must be a non-empty, trimmed string of at most ${maximum} characters.`);
}
function serializeRuntimeBundleManifest(data) {
  return JSON.stringify({
    schema: WASM_OJ_SCHEMAS.runtimeBundle,
    version: WASM_OJ_CONTRACT_VERSION,
    name: data.name,
    target: data.target,
    language: data.language,
    runtime: {
      package: data.runtimePackage,
      command: data.command
    },
    execution: {
      deterministic: true,
      contractVersion: WASM_OJ_CONTRACT_VERSION
    },
    entry: data.entry,
    files: [...data.files]
  }, null, 2);
}
function createRuntimeBundleManifest(project, runtimePackage, command, entry) {
  requiredTrimmedString(project.name, "Project name");
  requiredTrimmedString(runtimePackage, "Runtime package");
  requiredTrimmedString(command, "Runtime command", 128);
  assertLanguageIdentifier(project.config.language);
  assertSafeRelativePath(entry, "Runtime bundle entry");
  return serializeRuntimeBundleManifest({
    name: project.name,
    target: project.config.target,
    language: project.config.language,
    runtimePackage,
    command,
    entry,
    files: canonicalProjectFiles(project.files).map((file) => file.path)
  });
}
function parseRuntimeBundleManifest(artifact) {
  let parsed;
  try {
    parsed = JSON.parse(artifact.manifest);
  } catch (error) {
    throw new Error("Runtime bundle manifest is not valid JSON.", { cause: error });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Runtime bundle manifest must be a JSON object.");
  const manifest = parsed;
  const runtime = manifest.runtime;
  const execution = manifest.execution;
  if (!runtime || typeof runtime !== "object" || Array.isArray(runtime)) throw new Error("Runtime bundle manifest runtime must be an object.");
  if (!execution || typeof execution !== "object" || Array.isArray(execution)) throw new Error("Runtime bundle manifest execution must be an object.");
  const runtimeRecord = runtime;
  const executionRecord = execution;
  requiredTrimmedString(manifest.name, "Runtime bundle manifest name");
  requiredTrimmedString(runtimeRecord.package, "Runtime bundle manifest package");
  requiredTrimmedString(runtimeRecord.command, "Runtime bundle manifest command", 128);
  if (manifest.target !== "wasip1" && manifest.target !== "wasix") throw new Error("Runtime bundle manifest has an invalid target.");
  if (typeof manifest.language !== "string") throw new Error("Runtime bundle manifest has an invalid language.");
  assertLanguageIdentifier(manifest.language);
  if (typeof manifest.entry !== "string") throw new Error("Runtime bundle manifest has an invalid entry.");
  assertSafeRelativePath(manifest.entry, "Runtime bundle manifest entry");
  if (!Array.isArray(manifest.files)) throw new Error("Runtime bundle manifest files must be an array.");
  const files = manifest.files.map((path, index) => {
    assertSafeRelativePath(path, `Runtime bundle manifest file ${index}`);
    return path;
  });
  const canonicalFiles = [...files].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
  if (new Set(files).size !== files.length || JSON.stringify(files) !== JSON.stringify(canonicalFiles)) throw new Error("Runtime bundle manifest files must be unique and canonically sorted.");
  if (manifest.schema !== WASM_OJ_SCHEMAS.runtimeBundle || manifest.version !== WASM_OJ_CONTRACT_VERSION || executionRecord.deterministic !== true || executionRecord.contractVersion !== WASM_OJ_CONTRACT_VERSION) throw new Error("Runtime bundle manifest does not match the current WASM-OJ contract.");
  const data = {
    name: manifest.name,
    target: manifest.target,
    language: manifest.language,
    runtimePackage: runtimeRecord.package,
    command: runtimeRecord.command,
    entry: manifest.entry,
    files
  };
  if (artifact.manifest !== serializeRuntimeBundleManifest(data)) throw new Error("Runtime bundle manifest must use the canonical WASM-OJ representation without extra fields.");
  return data;
}
function expectedBuiltinArtifactName(project) {
  switch (project.config.language) {
    case "c":
    case "cpp":
    case "go":
    case "rust":
      return `${project.name}.wasm`;
    case "python":
      return `${project.name}.python-${project.config.target}.json`;
    case "javascript":
    case "typescript":
      return `${project.name}.${project.config.language}-${project.config.target}.json`;
    default:
      throw new Error(`WASM-OJ has no built-in artifact name for '${project.config.language}'.`);
  }
}
function expectedRuntimeEntry(project) {
  if (project.config.language === "python") {
    if (!project.config.entry.endsWith(".py")) throw new Error("Python entry files must end in '.py'.");
    return project.config.entry;
  }
  if (project.config.language === "typescript") {
    if (!project.config.entry.endsWith(".ts")) throw new Error("TypeScript entry files must end in '.ts'.");
    return `${project.config.entry.slice(0, -3)}.js`;
  }
  return project.config.entry;
}
function assertArtifactMetadata(artifact) {
  if (artifact.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw new Error(`Artifact WASM-OJ contract '${String(artifact.wasmOjContract)}' is unsupported; expected '${WASM_OJ_CONTRACT_VERSION}'.`);
  requiredTrimmedString(artifact.id, "Artifact id");
  requiredTrimmedString(artifact.projectId, "Artifact projectId");
  requiredTrimmedString(artifact.cacheKey, "Artifact cacheKey");
  requiredTrimmedString(artifact.name, "Artifact name");
  if (typeof artifact.language !== "string") throw new Error("Artifact language must be a string.");
  assertLanguageIdentifier(artifact.language);
  if (artifact.target !== "wasip1" && artifact.target !== "wasix") throw new Error("Artifact target is invalid.");
  if (artifact.optimization !== "debug" && artifact.optimization !== "release") throw new Error("Artifact optimization is invalid.");
  if (typeof artifact.createdAt !== "number" || !Number.isFinite(artifact.createdAt) || artifact.createdAt < 0) throw new Error("Artifact createdAt must be a non-negative finite number.");
  if (typeof artifact.durationMs !== "number" || !Number.isFinite(artifact.durationMs) || artifact.durationMs < 0) throw new Error("Artifact durationMs must be a non-negative finite number.");
  if (!Number.isSafeInteger(artifact.size) || artifact.size < 0) throw new Error("Artifact size must be a non-negative safe integer.");
  if (!Array.isArray(artifact.toolchains)) throw new Error("Artifact toolchains must be an array.");
  const toolchains = artifact.toolchains;
  if (toolchains.length === 0 || toolchains.some((identity) => typeof identity !== "string" || !identity || identity !== identity.trim()) || new Set(toolchains).size !== toolchains.length) throw new Error("Artifact toolchains must be non-empty, unique, trimmed identities.");
  requiredTrimmedString(artifact.costProfile, "Artifact costProfile");
  if (artifact.dependencyLockSha256 !== void 0 && (typeof artifact.dependencyLockSha256 !== "string" || !/^[0-9a-f]{64}$/.test(artifact.dependencyLockSha256))) throw new Error("Artifact dependencyLockSha256 must be lowercase SHA-256 hexadecimal.");
}
function assertBuiltinContract(artifact) {
  if (!isBuiltinLanguage(artifact.language)) return;
  const toolchain = TOOLCHAINS[artifact.language];
  if (!toolchain.targets.includes(artifact.target)) throw new Error(`Artifact target '${artifact.target}' is unsupported for built-in language '${artifact.language}'.`);
  if (artifact.kind !== toolchain.artifact) throw new Error(`Built-in '${artifact.language}' artifacts must use kind '${toolchain.artifact}', not '${artifact.kind}'.`);
  const expectedToolchains = toolchainPackageIdentities(artifact.language);
  if (JSON.stringify(artifact.toolchains) !== JSON.stringify(expectedToolchains)) throw new Error(`Artifact toolchains do not match the canonical '${artifact.language}' toolchain identities.`);
  const expectedProfile = costProfileId(artifact.language, artifact.target, artifact.optimization);
  if (artifact.costProfile !== expectedProfile) throw new Error(`Artifact cost profile '${artifact.costProfile}' does not match ${artifact.language}/${artifact.target}/${artifact.optimization}.`);
  if (artifact.kind === "runtime-bundle") {
    const expectedCommand = RUNTIME_COMMANDS[artifact.language];
    if (artifact.runtimePackage !== toolchain.runtimePackage || artifact.command !== expectedCommand) throw new Error(`Built-in '${artifact.language}' artifact runtime package or command is not canonical.`);
  }
}
function assertBundle(artifact) {
  requiredTrimmedString(artifact.runtimePackage, "Runtime bundle package");
  requiredTrimmedString(artifact.command, "Runtime bundle command", 128);
  assertSafeRelativePath(artifact.entry, "Runtime bundle entry");
  requiredTrimmedString(artifact.manifest, "Runtime bundle manifest", 1048576);
  const entries = canonicalFileEntries(artifact.files);
  for (const [path, contents] of entries) if (typeof contents !== "string" && !(contents instanceof Uint8Array)) throw new Error(`Runtime bundle file '${path}' must contain text or Uint8Array bytes.`);
  if (!Object.hasOwn(artifact.files, artifact.entry)) throw new Error(`Runtime bundle entry '${artifact.entry}' is not present in its files.`);
  if (artifact.files["wasm-oj.manifest.json"] !== artifact.manifest) throw new Error("Runtime bundle must contain its exact manifest at 'wasm-oj.manifest.json'.");
  const manifest = parseRuntimeBundleManifest(artifact);
  if (manifest.target !== artifact.target || manifest.language !== artifact.language || manifest.runtimePackage !== artifact.runtimePackage || manifest.command !== artifact.command || manifest.entry !== artifact.entry) throw new Error("Runtime bundle manifest metadata does not match its artifact metadata.");
  return manifest;
}
function assertValidBuildArtifact(candidate, expectation) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) throw new Error("Build artifact must be an object.");
  const record = candidate;
  assertArtifactMetadata(record);
  if (record.kind !== "wasm" && record.kind !== "runtime-bundle") throw new Error("Artifact kind must be 'wasm' or 'runtime-bundle'.");
  const artifact = candidate;
  let manifest;
  let payloadSize;
  if (artifact.kind === "wasm") {
    if (!(artifact.bytes instanceof Uint8Array)) throw new Error("Wasm artifact bytes must be a Uint8Array.");
    payloadSize = artifact.bytes.byteLength;
  } else {
    manifest = assertBundle(artifact);
    payloadSize = canonicalFileEntries(artifact.files).reduce((total, [, contents]) => total + (typeof contents === "string" ? encoder$2.encode(contents).byteLength : contents.byteLength), 0);
  }
  if (artifact.size !== payloadSize) throw new Error(`Artifact size ${artifact.size} does not match payload size ${payloadSize}.`);
  assertBuiltinContract(artifact);
  if (!isBuiltinLanguage(artifact.language) && !isCostProfileFor(artifact.costProfile, artifact.language, artifact.target, artifact.optimization)) throw new Error(`Artifact cost profile '${artifact.costProfile}' does not match ${artifact.language}/${artifact.target}/${artifact.optimization}.`);
  if (!expectation) return;
  const { project, cacheKey } = expectation;
  canonicalProjectFiles(project.files);
  const expected = {
    cacheKey,
    projectId: project.id,
    language: project.config.language,
    target: project.config.target,
    optimization: project.config.optimization,
    dependencyLockSha256: project.dependencies?.lockSha256
  };
  for (const key of [
    "cacheKey",
    "projectId",
    "language",
    "target",
    "optimization",
    "dependencyLockSha256"
  ]) if (artifact[key] !== expected[key]) throw new Error(`Artifact ${key} '${String(artifact[key])}' does not match build identity '${String(expected[key])}'.`);
  if (!isBuiltinLanguage(project.config.language)) return;
  const expectedName = expectedBuiltinArtifactName(project);
  if (artifact.name !== expectedName) throw new Error(`Artifact name '${artifact.name}' does not match build identity '${expectedName}'.`);
  if (artifact.kind === "runtime-bundle") {
    const expectedEntry = expectedRuntimeEntry(project);
    if (artifact.entry !== expectedEntry) throw new Error(`Artifact entry '${artifact.entry}' does not match build identity '${expectedEntry}'.`);
    const expectedManifest = createRuntimeBundleManifest(project, artifact.runtimePackage, artifact.command, expectedEntry);
    if (artifact.manifest !== expectedManifest || manifest?.name !== project.name) throw new Error("Runtime bundle manifest does not match the canonical project build identity.");
  }
}
var SHA256_PATTERN$1 = /^[a-f0-9]{64}$/;
var ASSET_PATH_PATTERN = /^\/toolchains\/[A-Za-z0-9][A-Za-z0-9._+/-]*$/;
var BROWSER_BASE_SENTINEL = new URL("https://wasm-oj.invalid/");
function validateToolchainDescriptors(sources, expectedKind) {
  if (!Array.isArray(sources) || sources.length === 0) throw new Error("At least one explicit WASM-OJ toolchain source is required.");
  const kind = expectedKind ?? sources[0]?.kind;
  if (kind !== "browser" && kind !== "server") throw new Error("Toolchain sources must declare either the 'browser' or 'server' host kind.");
  const ids = /* @__PURE__ */ new Set();
  const languages = /* @__PURE__ */ new Set();
  const profiles = /* @__PURE__ */ new Set();
  const assets = /* @__PURE__ */ new Set();
  for (const [sourceIndex, source] of sources.entries()) {
    assertObject(source, `Toolchain source ${sourceIndex}`);
    if (source.kind !== kind) throw new Error(`Toolchain source ${sourceIndex} has host kind '${String(source.kind)}'; expected '${kind}'.`);
    if (kind === "browser") {
      assertExactKeys(source, [
        "kind",
        "descriptor",
        "baseUrl"
      ], `Browser toolchain source ${sourceIndex}`);
      assertBrowserBaseUrl(source.baseUrl, sourceIndex);
    } else {
      assertExactKeys(source, [
        "kind",
        "descriptor",
        "directory"
      ], `Server toolchain source ${sourceIndex}`);
      assertServerDirectory(source.directory, sourceIndex);
    }
    const descriptor2 = source.descriptor;
    validateDescriptor(descriptor2, sourceIndex);
    if (ids.has(descriptor2.id)) throw new Error(`Toolchain descriptor id '${descriptor2.id}' is registered more than once.`);
    ids.add(descriptor2.id);
    for (const language of descriptor2.languages) {
      if (languages.has(language)) throw new Error(`Toolchain language '${language}' is owned by more than one descriptor.`);
      languages.add(language);
    }
    for (const profile of descriptor2.profiles) {
      const key = profileKey(profile.language, profile.target, profile.optimization);
      if (profiles.has(key)) throw new Error(`Toolchain profile '${key}' is registered more than once.`);
      profiles.add(key);
    }
    for (const asset of descriptor2.assets) {
      if (assets.has(asset.path)) throw new Error(`Toolchain asset '${asset.path}' is owned by more than one descriptor.`);
      assets.add(asset.path);
    }
  }
  return sources;
}
function validateBrowserToolchainSources(sources) {
  return validateToolchainDescriptors(sources, "browser");
}
function snapshotBrowserToolchainSources(sources) {
  validateBrowserToolchainSources(sources);
  const snapshot = sources.map((source) => Object.freeze({
    kind: "browser",
    baseUrl: source.baseUrl,
    descriptor: freezeDescriptor(source.descriptor)
  }));
  return Object.freeze(snapshot);
}
function toolchainAssetSource(sources, path) {
  assertAssetPath(path, "Requested toolchain asset path");
  let found;
  for (const source of sources) {
    const asset = source.descriptor.assets.find((candidate) => candidate.path === path);
    if (!asset) continue;
    if (found) throw new Error(`Toolchain asset '${path}' has more than one source.`);
    found = {
      source,
      asset
    };
  }
  if (!found) throw new Error(`No explicit toolchain source declares asset '${path}'.`);
  return found;
}
function toolchainProfileSource(sources, language, target, optimization) {
  const key = profileKey(language, target, optimization);
  let found;
  for (const source of sources) {
    const profile = source.descriptor.profiles.find((candidate) => profileKey(candidate.language, candidate.target, candidate.optimization) === key);
    if (!profile) continue;
    if (found) throw new Error(`Toolchain profile '${key}' has more than one source.`);
    found = {
      source,
      profile
    };
  }
  if (!found) throw new Error(`No explicit toolchain source declares profile '${key}'.`);
  return found;
}
function browserToolchainAssetBaseUrl(sources, path, resolutionBaseUrl) {
  const { source } = toolchainAssetSource(sources, path);
  const base = new URL(source.baseUrl, resolutionBaseUrl);
  if (!base.pathname.endsWith("/")) throw new Error(`Browser toolchain base URL '${source.baseUrl}' must end with '/'.`);
  return base;
}
function browserToolchainAssetUrl(sources, path, resolutionBaseUrl) {
  const { asset } = toolchainAssetSource(sources, path);
  const base = browserToolchainAssetBaseUrl(sources, path, resolutionBaseUrl);
  const inheritedSearch = [...base.searchParams];
  base.search = "";
  const url = new URL(asset.path.slice(asset.path.lastIndexOf("/") + 1), base);
  for (const [name, value] of inheritedSearch) url.searchParams.append(name, value);
  url.searchParams.set("sha256", asset.sha256);
  return url;
}
function validateDescriptor(descriptor2, sourceIndex) {
  const label = `Toolchain descriptor ${sourceIndex}`;
  assertObject(descriptor2, label);
  assertExactKeys(descriptor2, [
    "schema",
    "id",
    "version",
    "wasmOjContract",
    "languages",
    "profiles",
    "assets"
  ], label);
  if (descriptor2.schema !== WASM_OJ_SCHEMAS.toolchainPackage) throw new Error(`${label} schema '${String(descriptor2.schema)}' is unsupported; expected '${WASM_OJ_SCHEMAS.toolchainPackage}'.`);
  if (descriptor2.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw new Error(`${label} contract '${String(descriptor2.wasmOjContract)}' is unsupported; expected '${WASM_OJ_CONTRACT_VERSION}'.`);
  assertTrimmedString(descriptor2.id, `${label} id`, 214);
  assertTrimmedString(descriptor2.version, `${label} version`, 128);
  if (!Array.isArray(descriptor2.languages) || descriptor2.languages.length === 0) throw new Error(`${label} must declare at least one language.`);
  if (!Array.isArray(descriptor2.profiles) || descriptor2.profiles.length === 0) throw new Error(`${label} must declare at least one build profile.`);
  if (!Array.isArray(descriptor2.assets) || descriptor2.assets.length === 0) throw new Error(`${label} must declare at least one digest-pinned asset.`);
  const descriptorLanguages = /* @__PURE__ */ new Set();
  for (const language of descriptor2.languages) {
    assertLanguageIdentifier(language);
    if (descriptorLanguages.has(language)) throw new Error(`${label} repeats language '${language}'.`);
    descriptorLanguages.add(language);
  }
  const descriptorProfiles = /* @__PURE__ */ new Set();
  for (const [profileIndex, profile] of descriptor2.profiles.entries()) {
    assertObject(profile, `${label} profile ${profileIndex}`);
    assertExactKeys(profile, [
      "language",
      "target",
      "optimization"
    ], `${label} profile ${profileIndex}`);
    assertLanguageIdentifier(profile.language);
    if (!descriptorLanguages.has(profile.language)) throw new Error(`${label} profile ${profileIndex} references undeclared language '${profile.language}'.`);
    if (profile.target !== "wasip1" && profile.target !== "wasix") throw new Error(`${label} profile ${profileIndex} has unsupported target '${String(profile.target)}'.`);
    if (profile.optimization !== "debug" && profile.optimization !== "release") throw new Error(`${label} profile ${profileIndex} has unsupported optimization '${String(profile.optimization)}'.`);
    const key = profileKey(profile.language, profile.target, profile.optimization);
    if (descriptorProfiles.has(key)) throw new Error(`${label} repeats profile '${key}'.`);
    descriptorProfiles.add(key);
  }
  for (const language of descriptorLanguages) if (!descriptor2.profiles.some((profile) => profile.language === language)) throw new Error(`${label} language '${language}' has no build profile.`);
  const descriptorAssets = /* @__PURE__ */ new Set();
  for (const [assetIndex, asset] of descriptor2.assets.entries()) {
    const assetLabel = `${label} asset ${assetIndex}`;
    assertObject(asset, assetLabel);
    assertExactKeys(asset, [
      "path",
      "bytes",
      "sha256",
      "exportPath"
    ], assetLabel);
    assertAssetPath(asset.path, `${assetLabel} path`);
    if (descriptorAssets.has(asset.path)) throw new Error(`${label} repeats asset '${asset.path}'.`);
    descriptorAssets.add(asset.path);
    if (!Number.isSafeInteger(asset.bytes) || asset.bytes <= 0) throw new Error(`${assetLabel} bytes must be a positive safe integer.`);
    if (!SHA256_PATTERN$1.test(asset.sha256)) throw new Error(`${assetLabel} sha256 must be a lowercase hexadecimal SHA-256 digest.`);
    const expectedDigest = PINNED_TOOLCHAIN_ASSET_SHA256[asset.path];
    if (expectedDigest !== void 0 && asset.sha256 !== expectedDigest) throw new Error(`${assetLabel} digest '${asset.sha256}' does not match the WASM-OJ pin '${expectedDigest}'.`);
    const expectedExportPath = `./assets/${asset.path.slice(asset.path.lastIndexOf("/") + 1)}`;
    if (asset.exportPath !== expectedExportPath) throw new Error(`${assetLabel} exportPath must be '${expectedExportPath}'.`);
  }
}
function assertBrowserBaseUrl(baseUrl2, sourceIndex) {
  assertTrimmedString(baseUrl2, `Browser toolchain source ${sourceIndex} baseUrl`, 4096);
  let parsed;
  try {
    parsed = baseUrl2.startsWith("/") ? new URL(baseUrl2, BROWSER_BASE_SENTINEL) : new URL(baseUrl2);
  } catch {
    throw new Error(`Browser toolchain source ${sourceIndex} baseUrl must be absolute or root-relative.`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error(`Browser toolchain source ${sourceIndex} baseUrl must use HTTP or HTTPS.`);
  if (parsed.username || parsed.password) throw new Error(`Browser toolchain source ${sourceIndex} baseUrl must not contain credentials.`);
  if (parsed.hash) throw new Error(`Browser toolchain source ${sourceIndex} baseUrl must not contain a fragment.`);
  if (!parsed.pathname.endsWith("/")) throw new Error(`Browser toolchain source ${sourceIndex} baseUrl must identify a directory and end with '/'.`);
}
function assertServerDirectory(directory, sourceIndex) {
  if (!(directory instanceof URL)) throw new Error(`Server toolchain source ${sourceIndex} directory must be a URL.`);
  if (directory.protocol !== "file:") throw new Error(`Server toolchain source ${sourceIndex} directory must use the file: protocol.`);
  if (directory.search || directory.hash || !directory.pathname.endsWith("/")) throw new Error(`Server toolchain source ${sourceIndex} directory must be a query-free directory URL ending with '/'.`);
}
function assertAssetPath(path, label) {
  if (!ASSET_PATH_PATTERN.test(path) || path.includes("//")) throw new Error(`${label} must be a canonical absolute path below '/toolchains/'.`);
  const segments = path.split("/");
  if (segments.includes(".") || segments.includes("..")) throw new Error(`${label} must not contain traversal segments.`);
}
function profileKey(language, target, optimization) {
  return `${language}/${target}/${optimization}`;
}
function freezeDescriptor(descriptor2) {
  return Object.freeze({
    ...descriptor2,
    languages: Object.freeze([...descriptor2.languages]),
    profiles: Object.freeze(descriptor2.profiles.map((profile) => Object.freeze({ ...profile }))),
    assets: Object.freeze(descriptor2.assets.map((asset) => Object.freeze({ ...asset })))
  });
}
function assertObject(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label} must be an object.`);
}
function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) throw new Error(`${label} must contain exactly: ${canonical.join(", ")}.`);
}
function assertTrimmedString(value, label, maximumLength) {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim() || value.length > maximumLength) throw new Error(`${label} must be a non-empty trimmed string of at most ${maximumLength} characters.`);
}
async function projectCacheKeyForCompiler(project, compilerCacheIdentity) {
  if (project.dependencies) await verifyDependencyBuildBundle(project.dependencies);
  return sha256Hex$1(projectBuildIdentity(project, compilerCacheIdentity));
}
function assertCompilerCacheKey(cacheKey) {
  if (typeof cacheKey !== "string" || !cacheKey || cacheKey !== cacheKey.trim() || cacheKey.length > 16384) throw new Error("Compiler cache keys must be non-empty, trimmed strings of at most 16384 characters.");
}
function projectBuildIdentity(project, compilerCacheIdentity = JSON.stringify(toolchainCacheIdentity(project.config.language))) {
  if (!compilerCacheIdentity || compilerCacheIdentity !== compilerCacheIdentity.trim() || compilerCacheIdentity.length > 16384) throw new Error("Compiler cache identities must be non-empty, trimmed strings of at most 16384 characters.");
  return JSON.stringify({
    project: {
      id: project.id,
      name: project.name
    },
    config: {
      language: project.config.language,
      target: project.config.target,
      optimization: project.config.optimization,
      entry: project.config.entry
    },
    compiler: compilerCacheIdentity,
    files: canonicalProjectFiles(project.files).map(({ path, language, content }) => ({
      path,
      language,
      content
    })),
    ...project.dependencies === void 0 ? {} : { dependencies: {
      lockSha256: project.dependencies.lockSha256,
      packages: project.dependencies.packages.map((item) => ({
        id: item.package.id,
        filesSha256: item.filesSha256
      }))
    } }
  });
}
var CompileCoordinator = class {
  compiler;
  artifactStore;
  active;
  backgroundIntent = 0;
  lifecycleGeneration = 0;
  inFlightOperations = /* @__PURE__ */ new Set();
  cacheMutationTails = /* @__PURE__ */ new Map();
  constructor(compiler, artifactStore) {
    this.compiler = compiler;
    this.artifactStore = artifactStore;
  }
  compile(project, options = {}) {
    return this.track(this.compileOperation(project, options));
  }
  async compileOperation(project, options) {
    assertValidProject(project);
    const generation = this.lifecycleGeneration;
    const cacheKey = await this.cacheKey(project);
    this.assertCurrent(generation);
    const useCache = options.cache ?? true;
    if (this.active?.cacheKey === cacheKey) {
      this.backgroundIntent += 1;
      this.active.priority = "foreground";
      return this.active.promise;
    }
    if (useCache) {
      const cached = await this.loadCached(project, cacheKey);
      this.assertCurrent(generation);
      if (cached) return cached;
    }
    this.backgroundIntent += 1;
    if (this.active?.cacheKey === cacheKey) {
      this.active.priority = "foreground";
      return this.active.promise;
    }
    await this.cancelActiveBackground();
    this.assertCurrent(generation);
    if (this.active) throw new Error("The compiler already has a different foreground build in progress.");
    return this.start(project, cacheKey, "foreground", useCache);
  }
  precompile(project) {
    return this.track(this.precompileOperation(project));
  }
  async precompileOperation(project) {
    assertValidProject(project);
    const intent = ++this.backgroundIntent;
    const cacheKey = await this.cacheKey(project);
    if (intent !== this.backgroundIntent) return {
      cacheKey,
      status: "superseded"
    };
    try {
      const cached = await this.loadCached(project, cacheKey);
      if (intent !== this.backgroundIntent) return {
        cacheKey,
        status: "superseded"
      };
      if (cached) return {
        cacheKey,
        status: "ready",
        result: cached
      };
      if (this.active?.cacheKey === cacheKey) {
        const result2 = await this.active.promise;
        return intent === this.backgroundIntent ? outcomeFromBuild(cacheKey, result2) : {
          cacheKey,
          status: "superseded"
        };
      }
      await this.cancelActiveBackground();
      if (this.active || intent !== this.backgroundIntent) return {
        cacheKey,
        status: "superseded"
      };
      const result = await this.start(project, cacheKey, "background", true);
      return intent === this.backgroundIntent ? outcomeFromBuild(cacheKey, result) : {
        cacheKey,
        status: "superseded"
      };
    } catch (error) {
      if (intent !== this.backgroundIntent) return {
        cacheKey,
        status: "superseded"
      };
      return {
        cacheKey,
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
  supersedeBackground() {
    this.backgroundIntent += 1;
    const active = this.active;
    if (!active || active.priority !== "background") return;
    this.supersede(active);
    this.compiler.cancel();
  }
  /** Cancel every accepted compilation and release it before returning. */
  cancel() {
    this.backgroundIntent += 1;
    this.lifecycleGeneration += 1;
    const active = this.active;
    if (active) this.supersede(active);
    this.compiler.cancel();
  }
  /** Cancel accepted work and wait for hashing, cache I/O, builds, and persistence to settle. */
  async cancelAndWait() {
    this.cancel();
    while (this.inFlightOperations.size > 0) await Promise.allSettled([...this.inFlightOperations]);
  }
  /** Restart the compiler without allowing a retry to join stale work. */
  restart() {
    this.backgroundIntent += 1;
    this.lifecycleGeneration += 1;
    const active = this.active;
    if (active) this.supersede(active);
    this.compiler.restart();
  }
  dispose() {
    this.backgroundIntent += 1;
    this.lifecycleGeneration += 1;
    const active = this.active;
    if (active) this.supersede(active);
    this.compiler.dispose();
  }
  cacheKey(project) {
    return projectCacheKeyForCompiler(project, this.compiler.cacheIdentity(project));
  }
  async loadCached(project, cacheKey) {
    await this.cacheMutationTails.get(cacheKey);
    const artifact = await this.artifactStore?.load(cacheKey);
    if (!artifact) return void 0;
    try {
      assertValidBuildArtifact(artifact, {
        project,
        cacheKey
      });
    } catch (error) {
      console.warn(`Ignoring cached artifact '${cacheKey}' because its build identity is invalid.`, error);
      try {
        await this.artifactStore?.delete(cacheKey);
      } catch (deleteError) {
        console.warn(`Unable to evict invalid cached artifact '${cacheKey}'.`, deleteError);
      }
      return;
    }
    return {
      success: true,
      diagnostics: [],
      artifact,
      stdout: "",
      stderr: "",
      cacheHit: true
    };
  }
  start(project, cacheKey, priority, persist) {
    const state = { superseded: false };
    const promise = this.compiler.build(project, cacheKey).then(async (result) => {
      if (state.superseded) throw new Error("Compilation was superseded.");
      if (result.success) {
        if (!result.artifact) throw new Error("Compiler returned success without an artifact.");
        assertValidBuildArtifact(result.artifact, {
          project,
          cacheKey
        });
        const artifact = result.artifact;
        const artifactStore = this.artifactStore;
        if (persist && artifactStore) await this.queueCacheMutation(cacheKey, async () => {
          try {
            await artifactStore.save(artifact);
          } catch (error) {
            console.warn(`Unable to persist compiled artifact '${cacheKey}'.`, error);
          }
          if (state.superseded) try {
            await artifactStore.delete(cacheKey);
          } catch (error) {
            console.warn(`Unable to remove superseded artifact '${cacheKey}'.`, error);
          }
        });
      } else if (result.artifact) throw new Error("Compiler returned an artifact for a failed build.");
      if (state.superseded) throw new Error("Compilation was superseded.");
      return result;
    });
    const active = {
      cacheKey,
      priority,
      promise,
      state
    };
    this.active = active;
    promise.then(() => this.clearActive(active), () => this.clearActive(active));
    return promise;
  }
  async cancelActiveBackground() {
    const active = this.active;
    if (!active || active.priority !== "background") return;
    this.supersede(active);
    this.compiler.cancel();
    try {
      await active.promise;
    } catch {
    }
  }
  supersede(active) {
    active.state.superseded = true;
    this.clearActive(active);
  }
  assertCurrent(generation) {
    if (generation !== this.lifecycleGeneration) throw new Error("Compilation was superseded.");
  }
  clearActive(active) {
    if (this.active === active) this.active = void 0;
  }
  track(operation) {
    this.inFlightOperations.add(operation);
    operation.then(() => this.inFlightOperations.delete(operation), () => this.inFlightOperations.delete(operation));
    return operation;
  }
  queueCacheMutation(cacheKey, mutation) {
    const current = (this.cacheMutationTails.get(cacheKey) ?? Promise.resolve()).then(mutation, mutation);
    this.cacheMutationTails.set(cacheKey, current);
    current.then(() => {
      if (this.cacheMutationTails.get(cacheKey) === current) this.cacheMutationTails.delete(cacheKey);
    }, () => {
      if (this.cacheMutationTails.get(cacheKey) === current) this.cacheMutationTails.delete(cacheKey);
    });
    return current;
  }
};
function outcomeFromBuild(cacheKey, result) {
  return {
    cacheKey,
    status: result.success && result.artifact ? "ready" : "compile-error",
    result
  };
}
var WASM_PAGE_BYTES = 65536;
var WASM_MAGIC = [
  0,
  97,
  115,
  109,
  1,
  0,
  0,
  0
];
var VALUE_TYPES = /* @__PURE__ */ new Set([
  127,
  126,
  125,
  124,
  123,
  112,
  111
]);
var RESERVED_EXPORTS = /* @__PURE__ */ new Set(["gas_counter", "__wasm_oj_deferred_start"]);
var I32 = 127;
var I64 = 126;
var errno = (parameters) => ({
  parameters,
  results: [I32]
});
var WASIP1_SIGNATURES = Object.freeze({
  args_get: errno([I32, I32]),
  args_sizes_get: errno([I32, I32]),
  clock_res_get: errno([I32, I32]),
  clock_time_get: errno([
    I32,
    I64,
    I32
  ]),
  environ_get: errno([I32, I32]),
  environ_sizes_get: errno([I32, I32]),
  fd_advise: errno([
    I32,
    I64,
    I64,
    I32
  ]),
  fd_allocate: errno([
    I32,
    I64,
    I64
  ]),
  fd_close: errno([I32]),
  fd_datasync: errno([I32]),
  fd_fdstat_get: errno([I32, I32]),
  fd_fdstat_set_flags: errno([I32, I32]),
  fd_fdstat_set_rights: errno([
    I32,
    I64,
    I64
  ]),
  fd_filestat_get: errno([I32, I32]),
  fd_filestat_set_size: errno([I32, I64]),
  fd_filestat_set_times: errno([
    I32,
    I64,
    I64,
    I32
  ]),
  fd_pread: errno([
    I32,
    I32,
    I32,
    I64,
    I32
  ]),
  fd_prestat_dir_name: errno([
    I32,
    I32,
    I32
  ]),
  fd_prestat_get: errno([I32, I32]),
  fd_pwrite: errno([
    I32,
    I32,
    I32,
    I64,
    I32
  ]),
  fd_read: errno([
    I32,
    I32,
    I32,
    I32
  ]),
  fd_readdir: errno([
    I32,
    I32,
    I32,
    I64,
    I32
  ]),
  fd_renumber: errno([I32, I32]),
  fd_seek: errno([
    I32,
    I64,
    I32,
    I32
  ]),
  fd_sync: errno([I32]),
  fd_tell: errno([I32, I32]),
  fd_write: errno([
    I32,
    I32,
    I32,
    I32
  ]),
  path_create_directory: errno([
    I32,
    I32,
    I32
  ]),
  path_filestat_get: errno([
    I32,
    I32,
    I32,
    I32,
    I32
  ]),
  path_filestat_set_times: errno([
    I32,
    I32,
    I32,
    I32,
    I64,
    I64,
    I32
  ]),
  path_link: errno([
    I32,
    I32,
    I32,
    I32,
    I32,
    I32,
    I32
  ]),
  path_open: errno([
    I32,
    I32,
    I32,
    I32,
    I32,
    I64,
    I64,
    I32,
    I32
  ]),
  path_readlink: errno([
    I32,
    I32,
    I32,
    I32,
    I32,
    I32
  ]),
  path_remove_directory: errno([
    I32,
    I32,
    I32
  ]),
  path_rename: errno([
    I32,
    I32,
    I32,
    I32,
    I32,
    I32
  ]),
  path_symlink: errno([
    I32,
    I32,
    I32,
    I32,
    I32
  ]),
  path_unlink_file: errno([
    I32,
    I32,
    I32
  ]),
  poll_oneoff: errno([
    I32,
    I32,
    I32,
    I32
  ]),
  proc_exit: {
    parameters: [I32],
    results: []
  },
  proc_raise: errno([I32]),
  random_get: errno([I32, I32]),
  sched_yield: errno([])
});
var TRUSTED_JUDGE_WASIP1_IMPORTS = Object.freeze(/* @__PURE__ */ new Set([
  "args_get",
  "args_sizes_get",
  "clock_res_get",
  "clock_time_get",
  "environ_get",
  "environ_sizes_get",
  "fd_advise",
  "fd_allocate",
  "fd_close",
  "fd_datasync",
  "fd_fdstat_get",
  "fd_fdstat_set_flags",
  "fd_fdstat_set_rights",
  "fd_filestat_get",
  "fd_filestat_set_size",
  "fd_filestat_set_times",
  "fd_pread",
  "fd_prestat_dir_name",
  "fd_prestat_get",
  "fd_pwrite",
  "fd_read",
  "fd_readdir",
  "fd_renumber",
  "fd_seek",
  "fd_sync",
  "fd_tell",
  "fd_write",
  "path_create_directory",
  "path_filestat_get",
  "path_filestat_set_times",
  "path_link",
  "path_open",
  "path_readlink",
  "path_remove_directory",
  "path_rename",
  "path_symlink",
  "path_unlink_file",
  "poll_oneoff",
  "proc_exit",
  "proc_raise",
  "random_get",
  "sched_yield"
]));
var TRUSTED_JUDGE_RUNTIME_PROFILES = Object.freeze(/* @__PURE__ */ new Set([
  "c-wasip1-release",
  "cpp-wasip1-release",
  "rust-wasip1-release",
  "go-wasip1-release"
]));
var WasmReader = class WasmReader2 {
  bytes;
  label;
  offset = 0;
  constructor(bytes, label) {
    this.bytes = bytes;
    this.label = label;
  }
  get remaining() {
    return this.bytes.byteLength - this.offset;
  }
  done() {
    return this.offset === this.bytes.byteLength;
  }
  requireDone() {
    if (!this.done()) throw new TypeError(`${this.label} has trailing bytes.`);
  }
  byte() {
    if (this.offset >= this.bytes.byteLength) throw new TypeError(`${this.label} is truncated.`);
    return this.bytes[this.offset++];
  }
  u32() {
    let value = 0;
    let shift = 0;
    for (let index = 0; index < 5; index += 1) {
      const byte = this.byte();
      if (index === 4 && (byte & 240) !== 0) throw new TypeError(`${this.label} contains an overflowing varuint32.`);
      value += (byte & 127) * 2 ** shift;
      if ((byte & 128) === 0) return value >>> 0;
      shift += 7;
    }
    throw new TypeError(`${this.label} contains an invalid varuint32.`);
  }
  vector(read) {
    const count = this.u32();
    const result = [];
    for (let index = 0; index < count; index += 1) result.push(read(this, index));
    return result;
  }
  name() {
    const length = this.u32();
    if (length > 4096 || length > this.remaining) throw new TypeError(`${this.label} contains an invalid name length.`);
    const bytes = this.take(length);
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (error) {
      throw new TypeError(`${this.label} contains a non-UTF-8 name.`, { cause: error });
    }
  }
  take(length) {
    if (!Number.isSafeInteger(length) || length < 0 || length > this.remaining) throw new TypeError(`${this.label} is truncated.`);
    const result = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }
  section(length, label) {
    return new WasmReader2(this.take(length), label);
  }
};
function valueType(reader) {
  const type = reader.byte();
  if (!VALUE_TYPES.has(type)) throw new TypeError("Trusted judge Wasm uses a type outside the admitted core value-type surface.");
  return type;
}
function parseTypes(section) {
  const result = section.vector((reader) => {
    if (reader.byte() !== 96) throw new TypeError("Trusted judge Wasm may declare only core function types.");
    return {
      parameters: reader.vector((item) => valueType(item)),
      results: reader.vector((item) => valueType(item))
    };
  });
  section.requireDone();
  return result;
}
function parseImports(section) {
  const typeIndices = [];
  const names = [];
  section.vector((reader) => {
    const namespace = reader.name();
    const name = reader.name();
    if (reader.byte() !== 0) throw new TypeError(`Trusted judge import '${namespace}.${name}' must be a function.`);
    if (namespace !== "wasi_snapshot_preview1" || !TRUSTED_JUDGE_WASIP1_IMPORTS.has(name)) throw new TypeError(`Trusted judge import '${namespace}.${name}' is outside the admitted WASI Preview 1 surface.`);
    typeIndices.push(reader.u32());
    names.push(`${namespace}.${name}`);
  });
  section.requireDone();
  return {
    typeIndices,
    names
  };
}
function parseFunctions(section) {
  const result = section.vector((reader) => reader.u32());
  section.requireDone();
  return result;
}
function parseMemory(section) {
  const memories = section.vector((reader) => {
    const flags = reader.u32();
    if (flags !== 0 && flags !== 1) throw new TypeError("Trusted judge memory must be 32-bit, unshared, and use the default page size.");
    const initial = reader.u32();
    const maximum = flags === 1 ? reader.u32() : void 0;
    if (maximum !== void 0 && maximum < initial) throw new TypeError("Trusted judge memory maximum is below its initial size.");
    return {
      initial,
      ...maximum === void 0 ? {} : { maximum }
    };
  });
  section.requireDone();
  if (memories.length !== 1) throw new TypeError("Trusted judge Wasm must define exactly one linear memory.");
  return memories[0];
}
function parseExports(section) {
  const result = section.vector((reader) => ({
    name: reader.name(),
    kind: reader.byte(),
    index: reader.u32()
  }));
  section.requireDone();
  return result;
}
function assertHeader(bytes) {
  if (bytes.byteLength < WASM_MAGIC.length || WASM_MAGIC.some((byte, index) => bytes[index] !== byte)) throw new TypeError("Trusted judge artifact is not a core WebAssembly v1 module.");
}
function validateTrustedJudgeWasm(bytes, options = {}) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < WASM_MAGIC.length || bytes.byteLength > 8388608) throw new TypeError("Trusted judge Wasm is outside the 8 MiB artifact limit.");
  assertHeader(bytes);
  if (!WebAssembly.validate(bytes.slice().buffer)) throw new TypeError("Trusted judge artifact is not valid WebAssembly for the active runtime.");
  if (options.memoryLimitBytes !== void 0 && (!Number.isSafeInteger(options.memoryLimitBytes) || options.memoryLimitBytes < WASM_PAGE_BYTES || options.memoryLimitBytes % WASM_PAGE_BYTES !== 0)) throw new TypeError("Trusted judge memory limit must be a positive multiple of 64 KiB.");
  const reader = new WasmReader(bytes.subarray(WASM_MAGIC.length), "trusted judge module");
  let types = [];
  let importedTypes = [];
  let importNames = [];
  let definedTypes = [];
  let memory;
  let exports = [];
  while (!reader.done()) {
    const id = reader.byte();
    const length = reader.u32();
    const section = reader.section(length, `trusted judge section ${id}`);
    if (id === 0) continue;
    if (id === 1) types = parseTypes(section);
    else if (id === 2) ({ typeIndices: importedTypes, names: importNames } = parseImports(section));
    else if (id === 3) definedTypes = parseFunctions(section);
    else if (id === 5) memory = parseMemory(section);
    else if (id === 7) exports = parseExports(section);
    else if (id === 8) throw new TypeError("Trusted judge Wasm must not declare a start section; '_start' is the only entrypoint.");
  }
  if (!memory) throw new TypeError("Trusted judge Wasm must define exactly one linear memory.");
  if (options.memoryLimitBytes !== void 0 && memory.initial * WASM_PAGE_BYTES > options.memoryLimitBytes) throw new TypeError("Trusted judge initial memory exceeds the problem memory limit.");
  for (const entry of exports) {
    if (RESERVED_EXPORTS.has(entry.name) || entry.name.startsWith("__wasm_oj_")) throw new TypeError(`Trusted judge export '${entry.name}' is reserved by WASM-OJ.`);
    if (entry.name !== "memory" && entry.name !== "_start") throw new TypeError(`Trusted judge export '${entry.name}' is outside the admitted command ABI.`);
  }
  const memoryExport = exports.filter((entry) => entry.name === "memory");
  if (memoryExport.length !== 1 || memoryExport[0].kind !== 2 || memoryExport[0].index !== 0) throw new TypeError("Trusted judge Wasm must export its sole linear memory as 'memory'.");
  const startExports = exports.filter((entry) => entry.name === "_start");
  if (startExports.length !== 1 || startExports[0].kind !== 0) throw new TypeError("Trusted judge Wasm must export exactly one '_start' function.");
  const startIndex = startExports[0].index;
  if (startIndex < importedTypes.length) throw new TypeError("Trusted judge '_start' must be defined by the module.");
  const typeIndex = definedTypes[startIndex - importedTypes.length];
  const type = typeIndex === void 0 ? void 0 : types[typeIndex];
  if (!type || type.parameters.length !== 0 || type.results.length !== 0) throw new TypeError("Trusted judge '_start' must have the signature () -> ().");
  for (const typeIndexValue of [...importedTypes, ...definedTypes]) if (!types[typeIndexValue]) throw new TypeError("Trusted judge function refers to a missing type.");
  if (new Set(importNames).size !== importNames.length) throw new TypeError("Trusted judge Wasm repeats a WASI import.");
  for (const [index, qualifiedName] of importNames.entries()) {
    const expected = WASIP1_SIGNATURES[qualifiedName.slice(23)];
    const actual = types[importedTypes[index]];
    if (JSON.stringify(actual.parameters) !== JSON.stringify(expected.parameters) || JSON.stringify(actual.results) !== JSON.stringify(expected.results)) throw new TypeError(`Trusted judge import '${qualifiedName}' has an invalid WASI ABI signature.`);
  }
  return {
    bytes: bytes.byteLength,
    initialMemoryPages: memory.initial,
    ...memory.maximum === void 0 ? {} : { maximumMemoryPages: memory.maximum },
    imports: [...importNames]
  };
}
function normalizeOutput(value, mode) {
  if (mode === "exact") return value;
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd());
  while (lines.at(-1) === "") lines.pop();
  const normalized = lines.join("\n");
  return mode === "trimmed-lines" ? normalized.trim() : normalized;
}
function validateJudgeSpec(spec) {
  if (!spec || typeof spec !== "object") throw new TypeError("Judge spec must be an object.");
  if (spec.version !== WASM_OJ_CONTRACT_VERSION) throw new Error(`Unsupported judge spec version '${String(spec.version)}'.`);
  if (!Array.isArray(spec.cases)) throw new TypeError("Judge spec cases must be an array.");
  if (spec.cases.length === 0) throw new Error("A judge spec must contain at least one case.");
  if (spec.failFast !== void 0 && typeof spec.failFast !== "boolean") throw new TypeError("Judge spec failFast must be a boolean.");
  const ids = /* @__PURE__ */ new Set();
  for (const [index, item] of spec.cases.entries()) {
    if (!item || typeof item !== "object") throw new TypeError(`Judge case ${index} must be an object.`);
    assertJudgeIdentifier(item.id, `Judge case ${index} ID`);
    if (ids.has(item.id)) throw new Error(`Duplicate judge case ID '${item.id}'.`);
    ids.add(item.id);
    if (item.kind !== "batch" && item.kind !== "interactive") throw new Error(`Judge case '${item.id}' kind must be 'batch' or 'interactive'.`);
    if (item.kind === "batch") {
      if (!item.matcher || typeof item.matcher !== "object") throw new TypeError(`Judge case '${item.id}' matcher must be an object.`);
      assertJudgeIdentifier(item.matcher.id, `Judge case '${item.id}' matcher ID`);
      if (!item.matcher.config || typeof item.matcher.config !== "object" || Array.isArray(item.matcher.config)) throw new TypeError(`Judge case '${item.id}' matcher config must be a record.`);
      validateProgramSpec(item, item.id, "batch program");
      validateOutputPaths(item.outputPaths, item.id);
    } else validateInteractiveCase(item);
    if (!item.input || typeof item.input !== "object") throw new TypeError(`Judge case '${item.id}' input must be an object.`);
    if (item.files !== void 0) {
      if (!item.files || typeof item.files !== "object" || Array.isArray(item.files)) throw new TypeError(`Judge case '${item.id}' files must be a record.`);
      if (Object.keys(item.files).length > 256) throw new Error(`Judge case '${item.id}' has too many input files.`);
      for (const [path, input] of Object.entries(item.files)) {
        assertGuestFilePath(path, `Judge case '${item.id}' input file path`);
        validateFileInputSpec(input, `Judge case '${item.id}' input file '${path}'`);
      }
    }
    if (item.input.kind === "inline") {
      if (typeof item.input.value !== "string") throw new TypeError(`Judge case '${item.id}' inline input must be a string.`);
    } else if (item.input.kind === "provider") {
      assertJudgeIdentifier(item.input.provider, `Judge case '${item.id}' input provider`);
      assertCanonicalString(item.input.key, `Judge case '${item.id}' input key`, 4096);
      if (item.input.sha256 !== void 0 && (typeof item.input.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(item.input.sha256))) throw new Error(`Judge case '${item.id}' input SHA-256 digest must be lowercase hexadecimal.`);
    } else throw new Error(`Judge case '${item.id}' has unsupported input kind '${String(item.input.kind)}'.`);
    if (item.determinism !== void 0 && (!item.determinism || typeof item.determinism !== "object" || Array.isArray(item.determinism))) throw new TypeError(`Judge case '${item.id}' determinism must be a record.`);
    resolveDeterminism(item.determinism);
  }
}
function validateInteractiveCase(item) {
  if (item.contestant !== void 0) validateProgramSpec(item.contestant, item.id, "contestant");
  if (!item.interactor || typeof item.interactor !== "object" || Array.isArray(item.interactor)) throw new TypeError(`Judge case '${item.id}' interactor must be an object.`);
  validateProgramSpec(item.interactor, item.id, "interactor");
  assertGuestFilePath(item.interactor.inputPath, `Judge case '${item.id}' interactor inputPath`);
  validateTrustedProgram(item.interactor.program, `Judge case '${item.id}' interactor`);
}
function validateTrustedProgram(value, label) {
  if (!value || typeof value !== "object" || !(value.wasm instanceof Uint8Array)) throw new TypeError(`${label} must be a trusted judge program.`);
  validateTrustedJudgeWasm(value.wasm);
}
function validateProgramSpec(value, caseId, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`Judge case '${caseId}' ${label} must be an object.`);
  if (value.args !== void 0 && (!Array.isArray(value.args) || value.args.some((argument) => typeof argument !== "string"))) throw new TypeError(`Judge case '${caseId}' ${label} args must be an array of strings.`);
  if (value.env !== void 0) validateEnvironment(value.env, `Judge case '${caseId}' ${label} environment`);
  if (value.cwd !== void 0) assertGuestDirectoryPath(value.cwd, `Judge case '${caseId}' ${label} cwd`);
  if (value.resources !== void 0 && (!value.resources || typeof value.resources !== "object" || Array.isArray(value.resources))) throw new TypeError(`Judge case '${caseId}' ${label} resources must be a record.`);
  resolveResourcePolicy(value.resources);
}
function validateOutputPaths(outputPaths, caseId) {
  if (outputPaths === void 0) return;
  if (!Array.isArray(outputPaths) || outputPaths.length > 256) throw new TypeError(`Judge case '${caseId}' outputPaths must be an array of at most 256 paths.`);
  const paths = outputPaths.map((path) => assertGuestFilePath(path, `Judge case '${caseId}' output path`)).sort();
  if (paths.some((path, index) => index > 0 && paths[index - 1] === path)) throw new Error(`Judge case '${caseId}' output paths must be unique.`);
}
function validateInputSpec(input, label) {
  if (!input || typeof input !== "object") throw new TypeError(`${label} must be an object.`);
  if (input.kind === "inline") {
    if (typeof input.value !== "string") throw new TypeError(`${label} inline value must be a string.`);
    return;
  }
  if (input.kind !== "provider") throw new Error(`${label} has an unsupported input kind.`);
  assertJudgeIdentifier(input.provider, `${label} provider`);
  assertCanonicalString(input.key, `${label} key`, 4096);
  if (input.sha256 !== void 0 && !/^[0-9a-f]{64}$/.test(input.sha256)) throw new Error(`${label} SHA-256 digest must be lowercase hexadecimal.`);
}
function validateFileInputSpec(input, label) {
  if (input?.kind === "inline-bytes") {
    if (!(input.value instanceof Uint8Array)) throw new TypeError(`${label} inline bytes must be a Uint8Array.`);
    return;
  }
  validateInputSpec(input, label);
}
function assertJudgeGuestFilePath(value, label = "Judge guest file path") {
  return assertGuestFilePath(value, label);
}
function assertGuestFilePath(value, label) {
  if (typeof value !== "string" || value === "/" || !isNormalizedGuestPath(value)) throw new Error(`${label} must be an absolute normalized file path.`);
  return value;
}
function assertGuestDirectoryPath(value, label) {
  if (typeof value !== "string" || !isNormalizedGuestPath(value)) throw new Error(`${label} must be an absolute normalized path.`);
  return value;
}
function isNormalizedGuestPath(path) {
  return path.startsWith("/") && path.length <= 4096 && !path.includes("\\") && !path.includes("\0") && (path === "/" || !path.endsWith("/") && !path.includes("//")) && !path.split("/").some((part) => part === "." || part === "..");
}
function assertJudgeIdentifier(value, label) {
  assertCanonicalString(value, label, 128);
}
function assertCanonicalString(value, label, maximum) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum) throw new Error(`${label} must be a non-empty, trimmed string of at most ${maximum} characters.`);
}
function validateEnvironment(value, caseLabel) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`Judge case '${caseLabel}' env must be a record.`);
  for (const [name, contents] of Object.entries(value)) {
    if (!name || name.includes("=") || name.includes("\0")) throw new Error(`Judge case '${caseLabel}' has invalid environment variable name '${name}'.`);
    if (typeof contents !== "string" || contents.includes("\0")) throw new Error(`Judge case '${caseLabel}' environment variable '${name}' must be a NUL-free string.`);
  }
}
var JudgeEngine = class {
  executor;
  inputs = /* @__PURE__ */ new Map();
  matchers = /* @__PURE__ */ new Map();
  constructor(executor, options = {}) {
    this.executor = executor;
    this.registerMatcher(textOutputMatcher);
    this.registerMatcher(sha256OutputMatcher);
    this.registerMatcher(fileOutputMatcher);
    this.registerMatcher(tokenOutputMatcher);
    this.registerMatcher(floatOutputMatcher);
    this.registerMatcher(setOutputMatcher);
    this.registerMatcher(wasmCheckerOutputMatcher(this.executor));
    for (const provider of options.inputProviders ?? []) this.registerInputProvider(provider);
    for (const matcher of options.matchers ?? []) this.registerMatcher(matcher);
  }
  registerInputProvider(provider) {
    if (!provider || typeof provider !== "object" || typeof provider.resolve !== "function") throw new TypeError("Judge input providers must be objects implementing resolve().");
    registerUnique(this.inputs, provider.id, provider, "input provider");
  }
  registerMatcher(matcher) {
    if (!matcher || typeof matcher !== "object" || typeof matcher.match !== "function") throw new TypeError("Judge matchers must be objects implementing match().");
    registerUnique(this.matchers, matcher.id, matcher, "matcher");
  }
  async judge(artifact, spec, options = {}) {
    assertValidBuildArtifact(artifact);
    validateJudgeSpec(spec);
    const retention = options.retention ?? "full";
    if (retention !== "full" && retention !== "metrics-only") throw new TypeError("Judge result retention must be 'full' or 'metrics-only'.");
    if (options.aggregateOutputLimitBytes !== void 0 && (!Number.isSafeInteger(options.aggregateOutputLimitBytes) || options.aggregateOutputLimitBytes < 1)) throw new RangeError("Judge aggregateOutputLimitBytes must be a positive safe integer.");
    const cases = [];
    let aggregateOutputBytes = 0;
    for (const [index, caseSpec] of spec.cases.entries()) {
      let result = await this.runCase(artifact, caseSpec);
      const caseOutputBytes = retainedOutputBytes(result);
      const exceedsAggregateLimit = options.aggregateOutputLimitBytes !== void 0 && caseOutputBytes > options.aggregateOutputLimitBytes - aggregateOutputBytes;
      aggregateOutputBytes += caseOutputBytes;
      await options.onOutputBytes?.(caseOutputBytes, aggregateOutputBytes);
      if (exceedsAggregateLimit && result.verdict !== "judge-error") result = {
        ...result,
        verdict: "output-limit",
        message: "The submission exceeded the judge job's cumulative output limit."
      };
      result = retainCaseResult(result, retention);
      cases.push(result);
      await options.onCase?.(result, cases.length, spec.cases.length);
      if (result.verdict === "judge-error") break;
      if (exceedsAggregateLimit) {
        for (const remaining of spec.cases.slice(index + 1)) cases.push({
          id: remaining.id,
          verdict: "output-limit"
        });
        break;
      }
      if ((spec.failFast ?? true) && result.verdict !== "accepted") break;
    }
    return summarize(cases, spec.cases.length);
  }
  async runCase(artifact, caseSpec) {
    try {
      const input = await this.resolveInput(caseSpec);
      if (caseSpec.kind === "interactive") {
        const interaction = await this.executor.interact(artifact, caseSpec, input);
        const verdict = interactiveVerdict(interaction);
        return {
          id: caseSpec.id,
          verdict,
          ...verdict === "wrong-answer" ? { message: "Interactor rejected the protocol." } : {},
          interaction
        };
      }
      const run = await this.executor.run(artifact, caseSpec, input);
      const termination = terminationVerdict(run);
      if (termination) return {
        id: caseSpec.id,
        verdict: termination,
        run
      };
      const matcher = this.matchers.get(caseSpec.matcher.id);
      if (!matcher) throw new Error(`No judge matcher is registered for '${caseSpec.matcher.id}'.`);
      const matched = await matcher.match(caseSpec.matcher, {
        case: caseSpec,
        artifact,
        stdin: input.stdin,
        run,
        stdout: run.stdout,
        stderr: run.stderr,
        files: run.files
      });
      if (matched.auxiliaryOutputBytes !== void 0 && (!Number.isSafeInteger(matched.auxiliaryOutputBytes) || matched.auxiliaryOutputBytes < 0)) throw new Error("Judge matcher auxiliary output bytes must be a non-negative safe integer.");
      return withAuxiliaryOutput({
        id: caseSpec.id,
        verdict: matched.accepted ? "accepted" : "wrong-answer",
        message: matched.message,
        run
      }, matched.auxiliaryOutputBytes ?? 0);
    } catch (error) {
      return {
        id: caseSpec.id,
        verdict: "judge-error",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async resolveInput(caseSpec) {
    const stdin = await this.resolveInputSpec(caseSpec.input, caseSpec);
    const files = {};
    for (const [path, input] of Object.entries(caseSpec.files ?? {}).sort(([left], [right]) => left.localeCompare(right))) files[path] = input.kind === "inline-bytes" ? input.value.slice() : new TextEncoder().encode(await this.resolveInputSpec(input, caseSpec));
    return {
      stdin,
      files
    };
  }
  async resolveInputSpec(input, caseSpec) {
    if (input.kind === "inline") return input.value;
    const provider = this.inputs.get(input.provider);
    if (!provider) throw new Error(`No judge input provider is registered for '${input.provider}'.`);
    const value = await provider.resolve(input, caseSpec);
    if (input.sha256 && await sha256Hex$1(value) !== input.sha256.toLowerCase()) throw new Error(`Input provider '${provider.id}' returned data with the wrong SHA-256 digest.`);
    return value;
  }
};
var AUXILIARY_OUTPUT_BYTES = Symbol("judge-auxiliary-output-bytes");
function withAuxiliaryOutput(result, bytes) {
  if (bytes === 0) return result;
  Object.defineProperty(result, AUXILIARY_OUTPUT_BYTES, {
    value: bytes,
    enumerable: false
  });
  return result;
}
function retainedOutputBytes(result) {
  const auxiliary = result[AUXILIARY_OUTPUT_BYTES] ?? 0;
  if (result.run) return auxiliary + utf8Bytes(result.run.stdout) + utf8Bytes(result.run.stderr) + Object.values(result.run.files).reduce((total, bytes) => total + bytes.byteLength, 0);
  if (result.interaction) return auxiliary + utf8Bytes(result.interaction.contestant.stderr) + utf8Bytes(result.interaction.interactor.stderr) + utf8Bytes(result.interaction.contestantToInteractor) + utf8Bytes(result.interaction.interactorToContestant);
  return auxiliary;
}
function utf8Bytes(value) {
  return new TextEncoder().encode(value).byteLength;
}
function retainCaseResult(result, retention) {
  if (retention === "full") return result;
  const run = result.run === void 0 ? void 0 : {
    code: result.run.code,
    stdout: "",
    stderr: "",
    files: {},
    durationMs: result.run.durationMs,
    determinism: result.run.determinism,
    resources: result.run.resources,
    termination: result.run.termination,
    metrics: result.run.metrics
  };
  const interaction = result.interaction === void 0 ? void 0 : {
    ...result.interaction,
    contestant: {
      ...result.interaction.contestant,
      stderr: ""
    },
    interactor: {
      ...result.interaction.interactor,
      stderr: ""
    },
    contestantToInteractor: "",
    interactorToContestant: ""
  };
  return {
    id: result.id,
    verdict: result.verdict,
    ...run === void 0 ? {} : { run },
    ...interaction === void 0 ? {} : { interaction }
  };
}
function createJudgeExecutor(adapter) {
  return {
    run: (artifact, caseSpec, input) => adapter.run(artifact, {
      args: caseSpec.args ?? [],
      stdin: input.stdin,
      env: caseSpec.env ?? {},
      files: cloneFiles(input.files),
      outputPaths: [...caseSpec.outputPaths ?? []],
      ...caseSpec.cwd === void 0 ? {} : { cwd: caseSpec.cwd },
      determinism: resolveDeterminism(caseSpec.determinism),
      resources: resolveResourcePolicy(caseSpec.resources)
    }),
    runTrusted: (program, caseSpec, input) => {
      if (!adapter.runTrusted) throw new Error("This WASM-OJ host cannot execute trusted judge programs.");
      return adapter.runTrusted(program, {
        args: caseSpec.args ?? [],
        stdin: input.stdin,
        env: caseSpec.env ?? {},
        files: cloneFiles(input.files),
        outputPaths: [...caseSpec.outputPaths ?? []],
        ...caseSpec.cwd === void 0 ? {} : { cwd: caseSpec.cwd },
        determinism: resolveDeterminism(caseSpec.determinism),
        resources: resolveResourcePolicy(caseSpec.resources)
      });
    },
    interact: (contestant, caseSpec, input) => {
      if (!adapter.interactTrusted) throw new Error("This WASM-OJ host cannot execute trusted interactors.");
      const interactorFiles = {
        ...cloneFiles(input.files),
        [caseSpec.interactor.inputPath]: new TextEncoder().encode(input.stdin)
      };
      return adapter.interactTrusted(contestant, caseSpec.interactor.program, {
        contestant: judgeProgramConfig(caseSpec.contestant),
        interactor: {
          ...judgeProgramConfig(caseSpec.interactor),
          files: interactorFiles
        },
        determinism: resolveDeterminism(caseSpec.determinism)
      });
    }
  };
}
function judgeProgramConfig(spec = {}) {
  return {
    args: [...spec.args ?? []],
    env: { ...spec.env ?? {} },
    ...spec.cwd === void 0 ? {} : { cwd: spec.cwd },
    resources: resolveResourcePolicy(spec.resources)
  };
}
function cloneFiles(files) {
  return Object.fromEntries(Object.entries(files).map(([path, contents]) => [path, contents.slice()]));
}
var textOutputMatcher = {
  id: "text",
  async match(spec, context) {
    const expected = requiredString(spec, "expected");
    const normalization = normalizationFrom(spec);
    const actual = normalizeOutput(context.stdout, normalization);
    const normalizedExpected = normalizeOutput(expected, normalization);
    return actual === normalizedExpected ? { accepted: true } : {
      accepted: false,
      message: `Output mismatch: expected ${JSON.stringify(normalizedExpected)}, received ${JSON.stringify(actual)}.`
    };
  }
};
var sha256OutputMatcher = {
  id: "sha256",
  async match(spec, context) {
    const digest = requiredString(spec, "digest").toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error("sha256 matcher requires a 64-character hexadecimal digest.");
    const actual = await sha256Hex$1(normalizeOutput(context.stdout, normalizationFrom(spec)));
    return actual === digest ? { accepted: true } : {
      accepted: false,
      message: `Output SHA-256 mismatch: expected ${digest}, received ${actual}.`
    };
  }
};
var fileOutputMatcher = {
  id: "files",
  async match(spec, context) {
    const expected = spec.config.expected;
    if (!expected || typeof expected !== "object" || Array.isArray(expected)) throw new Error("files matcher requires record config 'expected'.");
    const normalization = normalizationFrom(spec);
    const expectedRecord = expected;
    const expectedPaths = Object.keys(expectedRecord).sort();
    const actualPaths = Object.keys(context.files).sort();
    if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) return {
      accepted: false,
      message: `Output file set mismatch: expected ${expectedPaths.join(", ")}, received ${actualPaths.join(", ")}.`
    };
    const decoder2 = new TextDecoder("utf-8", { fatal: true });
    for (const path of expectedPaths) {
      const expectedContents = expectedRecord[path];
      if (typeof expectedContents !== "string") throw new Error(`Expected contents for '${path}' must be a string.`);
      if (normalizeOutput(decoder2.decode(context.files[path]), normalization) !== normalizeOutput(expectedContents, normalization)) return {
        accepted: false,
        message: `Output file '${path}' mismatch.`
      };
    }
    return { accepted: true };
  }
};
var tokenOutputMatcher = {
  id: "tokens",
  async match(spec, context) {
    const expected = tokens(requiredString(spec, "expected"));
    const actual = tokens(context.stdout);
    return arraysEqual(actual, expected) ? { accepted: true } : {
      accepted: false,
      message: `Token mismatch: expected ${expected.length} tokens, received ${actual.length}.`
    };
  }
};
var floatOutputMatcher = {
  id: "float",
  async match(spec, context) {
    const expected = tokens(requiredString(spec, "expected"));
    const actual = tokens(context.stdout);
    const absoluteTolerance = requiredTolerance(spec, "absoluteTolerance");
    const relativeTolerance = requiredTolerance(spec, "relativeTolerance");
    if (actual.length !== expected.length) return {
      accepted: false,
      message: `Float token count mismatch: expected ${expected.length}, received ${actual.length}.`
    };
    for (let index = 0; index < expected.length; index += 1) {
      const wanted = parseFiniteNumber(expected[index]);
      const received = parseFiniteNumber(actual[index]);
      if (wanted === void 0 || received === void 0) {
        if (actual[index] !== expected[index]) return {
          accepted: false,
          message: `Token ${index + 1} is not equal.`
        };
        continue;
      }
      const difference = Math.abs(received - wanted);
      const tolerance = Math.max(absoluteTolerance, relativeTolerance * Math.abs(wanted));
      if (difference > tolerance) return {
        accepted: false,
        message: `Float token ${index + 1} differs by ${difference}, exceeding ${tolerance}.`
      };
    }
    return { accepted: true };
  }
};
var setOutputMatcher = {
  id: "set",
  async match(spec, context) {
    const multiplicity = spec.config.multiplicity;
    if (typeof multiplicity !== "boolean") throw new Error("set matcher requires boolean config 'multiplicity'.");
    const normalize = (value) => {
      const values = tokens(value).sort();
      return multiplicity ? values : [...new Set(values)];
    };
    const expected = normalize(requiredString(spec, "expected"));
    return arraysEqual(normalize(context.stdout), expected) ? { accepted: true } : {
      accepted: false,
      message: `${multiplicity ? "Multiset" : "Set"} output mismatch.`
    };
  }
};
function wasmCheckerOutputMatcher(executor) {
  return {
    id: "wasm-checker",
    async match(spec, context) {
      const checker = spec.config.checker;
      if (!checker || typeof checker !== "object" || Array.isArray(checker)) throw new Error("wasm-checker matcher requires a trusted judge program.");
      const runtimeProfile = checker.runtimeProfile;
      const wasm = checker.wasm;
      if (typeof runtimeProfile !== "string" || !(wasm instanceof Uint8Array)) throw new Error("wasm-checker matcher requires a trusted judge program.");
      const program = {
        runtimeProfile,
        wasm
      };
      validateTrustedJudgeWasm(program.wasm);
      const expected = requiredString(spec, "expected");
      const configuredArgs = spec.config.args;
      if (!Array.isArray(configuredArgs) || configuredArgs.some((value) => typeof value !== "string")) throw new Error("wasm-checker matcher requires string array config 'args'.");
      const files = {
        "/checker/input.txt": new TextEncoder().encode(context.stdin),
        "/checker/expected.txt": new TextEncoder().encode(expected),
        "/checker/actual.txt": new TextEncoder().encode(context.stdout),
        "/checker/stderr.txt": new TextEncoder().encode(context.stderr)
      };
      const trustedFiles = spec.config.files;
      if (!trustedFiles || typeof trustedFiles !== "object" || Array.isArray(trustedFiles)) throw new Error("wasm-checker matcher requires a trusted file record.");
      for (const [path, contents] of Object.entries(trustedFiles)) {
        assertJudgeGuestFilePath(path, "Custom checker trusted file path");
        if (!path.startsWith("/checker/assets/")) throw new Error("Custom checker trusted files must be inside '/checker/assets/'.");
        if (!(contents instanceof Uint8Array)) throw new Error("Custom checker trusted file contents must be bytes.");
        if (Object.hasOwn(files, path)) throw new Error("Custom checker trusted file collides with a reserved path.");
        files[path] = contents.slice();
      }
      for (const [path, contents] of Object.entries(context.files)) files[`/checker/files${path}`] = contents.slice();
      const checkerCase = {
        kind: "batch",
        id: `${context.case.id}:checker`,
        input: {
          kind: "inline",
          value: ""
        },
        matcher: {
          id: "text",
          config: { expected: "" }
        },
        args: [
          "/checker/input.txt",
          "/checker/expected.txt",
          "/checker/actual.txt",
          "/checker/stderr.txt",
          ...configuredArgs
        ],
        env: {},
        determinism: context.case.determinism,
        resources: context.case.resources
      };
      const result = await executor.runTrusted(program, checkerCase, {
        stdin: "",
        files
      });
      if (result.termination !== "exited" || result.code !== 0 && result.code !== 1) throw new Error("Custom checker failed inside the judge sandbox.");
      return result.code === 0 ? {
        accepted: true,
        auxiliaryOutputBytes: retainedOutputBytes({
          id: checkerCase.id,
          verdict: "accepted",
          run: result
        })
      } : {
        accepted: false,
        message: "Custom checker rejected the output.",
        auxiliaryOutputBytes: retainedOutputBytes({
          id: checkerCase.id,
          verdict: "wrong-answer",
          run: result
        })
      };
    }
  };
}
function tokens(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/u) : [];
}
function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function requiredTolerance(spec, key) {
  const value = spec.config[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`float matcher requires finite non-negative config '${key}'.`);
  return value;
}
function parseFiniteNumber(value) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return void 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function requiredString(spec, key) {
  const value = spec.config[key];
  if (typeof value !== "string") throw new Error(`${spec.id} matcher requires string config '${key}'.`);
  return value;
}
function normalizationFrom(spec) {
  const value = spec.config.normalization ?? (spec.id === "sha256" ? "trimmed-lines" : "lines");
  if (value !== "exact" && value !== "lines" && value !== "trimmed-lines") throw new Error(`Unsupported output normalization '${String(value)}'.`);
  return value;
}
function terminationVerdict(run) {
  if (run.termination === "exited" && run.code === 0) return void 0;
  if (run.termination === "exited" || run.termination === "trap") return "runtime-error";
  return run.termination;
}
function interactiveVerdict(result) {
  const contestantTermination = interactiveContestantTerminationVerdict(result);
  if (contestantTermination && contestantTermination !== "runtime-error") return contestantTermination;
  if (result.interactor.termination !== "exited") return "judge-error";
  if (result.interactor.code === 1) return "wrong-answer";
  if (result.interactor.code !== 0) return "judge-error";
  return contestantTermination ?? "accepted";
}
function interactiveContestantTerminationVerdict(result) {
  const { contestant } = result;
  if (contestant.termination === "exited" && contestant.code === 0) return void 0;
  if (contestant.termination === "exited" || contestant.termination === "trap") return "runtime-error";
  return contestant.termination;
}
function registerUnique(registry, id, value, label) {
  if (typeof id !== "string" || !id || id !== id.trim() || id.length > 128) throw new Error(`Judge ${label} IDs must be non-empty, trimmed strings of at most 128 characters.`);
  if (registry.has(id)) throw new Error(`Judge ${label} '${id}' is already registered.`);
  registry.set(id, value);
}
function summarize(cases, total) {
  const metrics = cases.flatMap((item) => item.run ? [item.run.metrics] : item.interaction ? [item.interaction.contestant.metrics] : []);
  const sum = (values) => values.some((value) => value === null) ? null : values.reduce((totalValue, value) => totalValue + (value ?? 0), 0);
  const maximum = (values) => values.some((value) => value === null) ? null : Math.max(0, ...values.map((value) => value ?? 0));
  return {
    verdict: cases.find((item) => item.verdict !== "accepted")?.verdict ?? "accepted",
    completed: cases.length,
    total,
    cases,
    metrics: {
      cost: sum(metrics.map((value) => value.cost)),
      rawCost: sum(metrics.map((value) => value.rawCost)),
      baselineCost: metrics.reduce((totalValue, value) => totalValue + value.baselineCost, 0),
      logicalTimeNs: sum(metrics.map((value) => value.logicalTimeNs)),
      maxMemoryBytes: maximum(metrics.map((value) => value.memoryBytes)),
      maxFilesystemBytes: maximum(metrics.map((value) => value.filesystemBytes)),
      maxFilesystemEntries: maximum(metrics.map((value) => value.filesystemEntries)),
      stdoutBytes: sum(metrics.map((value) => value.stdoutBytes)),
      stderrBytes: sum(metrics.map((value) => value.stderrBytes))
    }
  };
}
function createDefaultDependencyBuildAdapters() {
  return [
    archiveAdapter("cargo", materializeCargo),
    archiveAdapter("npm", materializeNpm),
    archiveAdapter("pypi", materializePyPi),
    archiveAdapter("go", materializeGo),
    archiveAdapter("cpp", materializeCpp)
  ];
}
async function createDependencyBuildBundle(lock, payloads, adapters = createDefaultDependencyBuildAdapters()) {
  assertValidDependencyLock(lock);
  if (!(payloads instanceof Map)) throw new TypeError("Dependency payloads must be a package-ID keyed Map.");
  if (!Array.isArray(adapters)) throw new TypeError("Dependency build adapters must be an array.");
  if (lock.packages.length > DEPENDENCY_BUILD_LIMITS.packages) throw new RangeError(`Dependency build contains more than ${DEPENDENCY_BUILD_LIMITS.packages} packages.`);
  const adapterByEcosystem = /* @__PURE__ */ new Map();
  for (const adapter of adapters) {
    if (!adapter || typeof adapter !== "object" || typeof adapter.materialize !== "function") throw new TypeError("Dependency build adapters must implement materialize().");
    if (adapterByEcosystem.has(adapter.ecosystem)) throw new Error(`Dependency build adapter '${adapter.ecosystem}' is registered more than once.`);
    adapterByEcosystem.set(adapter.ecosystem, adapter);
  }
  const expectedIds = new Set(lock.packages.map((item) => item.id));
  const unexpected = [...payloads.keys()].filter((id) => !expectedIds.has(id)).sort();
  if (unexpected.length > 0) throw new Error(`Dependency payloads contain unknown packages: ${unexpected.join(", ")}.`);
  let totalBytes = 0;
  const packages = [];
  for (const packageRecord of lock.packages) {
    const payload = payloads.get(packageRecord.id);
    if (!(payload instanceof Uint8Array)) throw new Error(`Dependency payload '${packageRecord.id}' is missing.`);
    if (await sha256Hex$1(payload) !== packageRecord.integritySha256) throw new Error(`Dependency payload '${packageRecord.id}' failed integrity verification.`);
    const adapter = adapterByEcosystem.get(packageRecord.ecosystem);
    if (!adapter) throw new Error(`No dependency build adapter is registered for '${packageRecord.ecosystem}'.`);
    const files = canonicalDependencyFiles(await adapter.materialize(packageRecord, payload), packageRecord.id);
    totalBytes += Object.values(files).reduce((sum, bytes) => sum + bytes.byteLength, 0);
    if (totalBytes > DEPENDENCY_BUILD_LIMITS.totalBytes) throw new RangeError(`Dependency build exceeds ${DEPENDENCY_BUILD_LIMITS.totalBytes} extracted bytes.`);
    packages.push(Object.freeze({
      package: structuredClone(packageRecord),
      filesSha256: await dependencyFileTreeSha256(files),
      files: Object.freeze(files)
    }));
  }
  const bundle = Object.freeze({
    lock: structuredClone(lock),
    lockSha256: await dependencyLockSha256(lock),
    packages: Object.freeze(packages)
  });
  await verifyDependencyBuildBundle(bundle);
  return bundle;
}
function archiveAdapter(ecosystem, materialize) {
  return Object.freeze({
    ecosystem,
    async materialize(record, payload) {
      return materialize(record, payload);
    }
  });
}
function materializeCargo(record, payload) {
  const files = stripArchiveRoot(extractTar(gunzip(payload, record.id)), `${record.name}-${record.version}`, record.id);
  const manifest = requiredUtf8(files, "Cargo.toml", record.id);
  if (/^\s*proc-macro\s*=\s*true\s*$/m.test(manifest)) unsupported(record, "proc-macro crates");
  if (/^\s*build\s*=\s*(?:true|"[^"]+")\s*$/m.test(manifest) || Object.hasOwn(files, "build.rs")) unsupported(record, "Cargo build scripts");
  if (/^\s*links\s*=\s*"/m.test(manifest)) unsupported(record, "native Cargo links");
  rejectExtensions(files, record, [
    ".a",
    ".o",
    ".so",
    ".dylib",
    ".dll",
    ".wasm"
  ]);
  return files;
}
function materializeNpm(record, payload) {
  const files = stripArchiveRoot(extractTar(gunzip(payload, record.id)), "package", record.id);
  const packageJson = JSON.parse(requiredUtf8(files, "package.json", record.id));
  if (packageJson.scripts && typeof packageJson.scripts === "object") {
    const scripts = packageJson.scripts;
    const lifecycle = [
      "preinstall",
      "install",
      "postinstall",
      "prepare"
    ].find((name) => scripts[name] !== void 0);
    if (lifecycle) unsupported(record, `npm '${lifecycle}' lifecycle scripts`);
  }
  rejectExtensions(files, record, [
    ".node",
    ".so",
    ".dylib",
    ".dll"
  ]);
  return files;
}
function materializePyPi(record, payload) {
  if (!new URL(record.source).pathname.toLowerCase().endsWith(".whl")) unsupported(record, "PyPI source distributions and build backends");
  const files = extractZip(payload, record.id);
  rejectExtensions(files, record, [
    ".so",
    ".pyd",
    ".dylib",
    ".dll"
  ]);
  if (Object.keys(files).find((path) => path.includes(".data/purelib/"))) unsupported(record, "wheel .data installation remapping");
  return files;
}
function materializeGo(record, payload) {
  const stripped = stripArchiveRoot(extractZip(payload, record.id), `${record.name}@${record.version}`, record.id);
  rejectExtensions(stripped, record, [
    ".a",
    ".o",
    ".so",
    ".dylib",
    ".dll"
  ]);
  if (Object.keys(stripped).some((path) => path.endsWith(".s") || path.endsWith(".S"))) unsupported(record, "Go assembly sources");
  return stripped;
}
function materializeCpp(record, payload) {
  const stripped = stripSingleCommonRoot(isZip(payload) ? extractZip(payload, record.id) : extractTar(gunzip(payload, record.id)));
  rejectExtensions(stripped, record, [
    ".a",
    ".o",
    ".so",
    ".dylib",
    ".dll",
    ".wasm"
  ]);
  return stripped;
}
function extractZip(payload, id) {
  let extracted;
  let count = 0;
  let totalBytes = 0;
  try {
    extracted = unzipSync(payload, { filter(file) {
      if (file.name.endsWith("/")) return false;
      count += 1;
      totalBytes += file.originalSize;
      if (count > DEPENDENCY_BUILD_LIMITS.filesPerPackage || file.originalSize > DEPENDENCY_BUILD_LIMITS.bytesPerFile || totalBytes > DEPENDENCY_BUILD_LIMITS.totalBytes) throw new RangeError(`Dependency '${id}' ZIP exceeds its extracted-file limits.`);
      return true;
    } });
  } catch (error) {
    throw new Error(`Dependency '${id}' is not a valid ZIP archive.`, { cause: error });
  }
  return Object.fromEntries(Object.entries(extracted).filter(([path]) => !path.endsWith("/")));
}
function gunzip(payload, id) {
  const chunks = [];
  let totalBytes = 0;
  let complete = false;
  try {
    new Gunzip((chunk, final) => {
      totalBytes += chunk.byteLength;
      if (totalBytes > DEPENDENCY_BUILD_LIMITS.totalBytes + DEPENDENCY_BUILD_LIMITS.filesPerPackage * 512) throw new RangeError(`Dependency '${id}' gzip exceeds its extracted-byte limit.`);
      chunks.push(chunk.slice());
      complete = final;
    }).push(payload, true);
  } catch (error) {
    if (error instanceof RangeError && error.message.startsWith(`Dependency '${id}'`)) throw error;
    throw new Error(`Dependency '${id}' is not a valid gzip archive.`, { cause: error });
  }
  if (!complete) throw new Error(`Dependency '${id}' gzip stream is incomplete.`);
  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
function extractTar(payload) {
  const files = {};
  let offset = 0;
  let pendingLongPath;
  let pendingPaxPath;
  while (offset + 512 <= payload.byteLength) {
    const header = payload.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    verifyTarChecksum(header);
    const name = tarText(header.subarray(0, 100));
    const prefix = tarText(header.subarray(345, 500));
    const size = tarNumber(header.subarray(124, 136), "tar entry size");
    const type = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    if (dataEnd > payload.byteLength) throw new Error("Dependency tar entry exceeds its archive.");
    const data = payload.slice(dataStart, dataEnd);
    const rawPath = pendingPaxPath ?? pendingLongPath ?? (prefix ? `${prefix}/${name}` : name);
    pendingPaxPath = void 0;
    pendingLongPath = void 0;
    if (type === "L") pendingLongPath = tarText(data);
    else if (type === "x") pendingPaxPath = paxPath(data);
    else if (type === "g") paxPath(data);
    else if (type === "0" || type === "\0") files[rawPath] = data;
    else if (type !== "5") throw new Error(`Dependency tar entry '${rawPath}' uses unsupported type '${type}'.`);
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  if (offset > payload.byteLength) throw new Error("Dependency tar archive has invalid block padding.");
  return files;
}
function verifyTarChecksum(header) {
  const expected = tarNumber(header.subarray(148, 156), "tar header checksum");
  let actual = 0;
  for (let index = 0; index < header.length; index += 1) actual += index >= 148 && index < 156 ? 32 : header[index];
  if (actual !== expected) throw new Error("Dependency tar header checksum mismatch.");
}
function tarNumber(bytes, label) {
  if ((bytes[0] & 128) !== 0) throw new Error(`${label} uses unsupported base-256 encoding.`);
  const value = tarText(bytes).trim();
  if (!/^[0-7]*$/.test(value)) throw new Error(`${label} is not canonical octal.`);
  const number = value ? Number.parseInt(value, 8) : 0;
  if (!Number.isSafeInteger(number) || number < 0) throw new Error(`${label} exceeds the supported range.`);
  return number;
}
function tarText(bytes) {
  const nul = bytes.indexOf(0);
  return new TextDecoder("utf-8", { fatal: true }).decode(nul < 0 ? bytes : bytes.subarray(0, nul));
}
function paxPath(bytes) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  let offset = 0;
  let path;
  while (offset < text.length) {
    const space = text.indexOf(" ", offset);
    if (space < 0) throw new Error("Dependency PAX header has an invalid record length.");
    const length = Number(text.slice(offset, space));
    if (!Number.isSafeInteger(length) || length <= space - offset + 1 || offset + length > text.length) throw new Error("Dependency PAX header record exceeds its payload.");
    const record = text.slice(space + 1, offset + length - 1);
    const equals = record.indexOf("=");
    if (equals > 0 && record.slice(0, equals) === "path") path = record.slice(equals + 1);
    offset += length;
  }
  return path;
}
function stripArchiveRoot(files, root, id) {
  const prefix = `${root}/`;
  const entries = Object.entries(files);
  if (entries.length === 0 || entries.some(([path]) => !path.startsWith(prefix))) throw new Error(`Dependency '${id}' archive must use canonical root '${root}/'.`);
  return Object.fromEntries(entries.map(([path, bytes]) => [path.slice(prefix.length), bytes]));
}
function stripSingleCommonRoot(files) {
  const paths = Object.keys(files);
  if (paths.length === 0) return files;
  const root = paths[0].split("/")[0];
  return paths.every((path) => path.startsWith(`${root}/`)) ? Object.fromEntries(Object.entries(files).map(([path, bytes]) => [path.slice(root.length + 1), bytes])) : files;
}
function requiredUtf8(files, path, id) {
  const bytes = files[path];
  if (!bytes) throw new Error(`Dependency '${id}' omits required '${path}'.`);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
function rejectExtensions(files, record, extensions) {
  const path = Object.keys(files).find((candidate) => extensions.some((extension) => candidate.toLowerCase().endsWith(extension)));
  if (path) unsupported(record, `prebuilt/native file '${path}'`);
}
function unsupported(record, feature) {
  throw new Error(`Dependency '${record.id}' requires unsupported ${feature}.`);
}
function isZip(payload) {
  return payload.byteLength >= 4 && payload[0] === 80 && payload[1] === 75 && (payload[2] === 3 || payload[2] === 5 || payload[2] === 7);
}
function optionalMetadata(value, label, maximum) {
  if (value === void 0) return void 0;
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum) throw new Error(`${label} must be a non-empty, trimmed string of at most ${maximum} characters.`);
  return value;
}
function fileLanguage(path, projectLanguage) {
  const inferred = extensionLanguage(path);
  if (!inferred || path.endsWith(".h") || path.endsWith(".hpp")) return projectLanguage;
  return inferred;
}
function createSdkProject(input) {
  if (!input || typeof input !== "object") throw new TypeError("Compile input must be an object.");
  assertLanguageIdentifier(input.language);
  assertSafeRelativePath(input.entry, "Entry file");
  const entry = input.entry;
  if (!input.files || typeof input.files !== "object" || Array.isArray(input.files)) throw new TypeError("Compile input files must be a record.");
  const entries = Object.entries(input.files);
  if (entries.length === 0) throw new Error("A project must contain at least one source file.");
  const files = entries.map(([path, content]) => {
    assertSafeRelativePath(path, "Source file path");
    return {
      path,
      content,
      language: fileLanguage(path, input.language)
    };
  });
  if (!Object.hasOwn(input.files, entry)) throw new Error(`Entry file '${entry}' is not present in files.`);
  const target = input.target ?? "wasip1";
  if (target !== "wasip1" && target !== "wasix") throw new Error(`Unsupported target '${String(target)}'.`);
  if (isBuiltinLanguage(input.language) && !TOOLCHAINS[input.language].targets.includes(target)) throw new Error(`${input.language} does not support the ${target.toUpperCase()} target.`);
  if (input.language === "java" && target !== "wasip1") throw new Error("Java does not support the WASIX target.");
  const optimization = input.optimization ?? "release";
  if (optimization !== "debug" && optimization !== "release") throw new Error(`Unsupported optimization level '${String(optimization)}'.`);
  const inferredName = entry.split("/").at(-1)?.replace(/\.[^.]+$/, "") || "wasm-oj-project";
  const name = optionalMetadata(input.name, "Project name", 4096) ?? inferredName;
  const projectId = optionalMetadata(input.projectId, "Project ID", 16384) ?? `sdk:${name}`;
  if (input.dependencies !== void 0) assertValidDependencyBuildBundle(input.dependencies);
  return {
    id: projectId,
    name,
    files: canonicalProjectFiles(files),
    activeFile: entry,
    updatedAt: Date.now(),
    ...input.dependencies === void 0 ? {} : { dependencies: structuredClone(input.dependencies) },
    config: {
      language: input.language,
      target,
      optimization,
      entry,
      args: [],
      stdin: "",
      env: {},
      determinism: { ...DEFAULT_DETERMINISM },
      resources: { ...DEFAULT_RESOURCE_POLICY }
    }
  };
}
function deterministicTranscript(run) {
  return {
    code: run.code,
    stdout: run.stdout,
    stderr: run.stderr,
    files: Object.fromEntries(Object.entries(run.files).sort(([left], [right]) => left.localeCompare(right)).map(([path, contents]) => [path, bytesToHex$1(contents)])),
    termination: run.termination,
    trapMessage: run.trapMessage,
    determinism: run.determinism,
    resources: run.resources,
    metrics: run.metrics
  };
}
function bytesToHex$1(bytes) {
  let result = "";
  for (const byte of bytes) result += byte.toString(16).padStart(2, "0");
  return result;
}
async function artifactDigest(artifact) {
  const metadata = {
    kind: artifact.kind,
    wasmOjContract: artifact.wasmOjContract,
    projectId: artifact.projectId,
    cacheKey: artifact.cacheKey,
    name: artifact.name,
    language: artifact.language,
    target: artifact.target,
    optimization: artifact.optimization,
    size: artifact.size,
    toolchains: artifact.toolchains,
    costProfile: artifact.costProfile
  };
  if (artifact.kind === "wasm") return sha256Hex$1(JSON.stringify({
    ...metadata,
    bytesSha256: await sha256Hex$1(artifact.bytes)
  }));
  const files = [];
  for (const [path, contents] of canonicalFileEntries(artifact.files)) files.push([path, await sha256Hex$1(typeof contents === "string" ? contents : contents)]);
  return sha256Hex$1(JSON.stringify({
    ...metadata,
    runtimePackage: artifact.runtimePackage,
    command: artifact.command,
    entry: artifact.entry,
    manifest: artifact.manifest,
    files
  }));
}
var MAGIC$2 = new TextEncoder().encode("WOJRPL02");
var HEADER_BYTES$1 = MAGIC$2.byteLength + 8 + 4;
var encoder$1 = new TextEncoder();
var decoder$1 = new TextDecoder("utf-8", { fatal: true });
var SELF_CONTAINED_MATCHERS = /* @__PURE__ */ new Set([
  "text",
  "sha256",
  "files",
  "tokens",
  "float",
  "set",
  "wasm-checker"
]);
async function assertValidReplayBundle(value) {
  if (!isRecord$3(value) || value.schema !== WASM_OJ_SCHEMAS.replayBundle || value.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw new Error("ReplayBundle does not use the active WASM-OJ contract.");
  const bundleKeys = Object.keys(value).sort();
  const expectedBundleKeys = [
    "artifact",
    "artifactSha256",
    "wasmOjContract",
    "operation",
    "project",
    "projectSha256",
    "schema",
    ...value.dependencies === void 0 ? [] : ["dependencies"]
  ].sort();
  if (JSON.stringify(bundleKeys) !== JSON.stringify(expectedBundleKeys)) throw new Error("ReplayBundle contains unexpected fields.");
  assertValidProject(value.project);
  const project = value.project;
  if (project.updatedAt !== 0) throw new Error("ReplayBundle project.updatedAt must be normalized to zero.");
  if (JSON.stringify(project.files.map((file) => file.path)) !== JSON.stringify(canonicalProjectFiles(project.files).map((file) => file.path))) throw new Error("ReplayBundle project files must be canonically sorted.");
  requireSha256$1(value.projectSha256, "ReplayBundle project");
  if (value.projectSha256 !== await portableSha256(project)) throw new Error("ReplayBundle project digest mismatch.");
  assertValidBuildArtifact(value.artifact, {
    project,
    cacheKey: value.artifact.cacheKey
  });
  const artifact = value.artifact;
  requireSha256$1(value.artifactSha256, "ReplayBundle artifact");
  if (artifact.id !== `replay:${value.artifactSha256}` || artifact.createdAt !== 0 || artifact.durationMs !== 0 || value.artifactSha256 !== await artifactDigest(artifact)) throw new Error("ReplayBundle artifact metadata or digest is not canonical.");
  if (value.dependencies !== void 0) await assertOfflineDependencies(value.dependencies);
  if (!isRecord$3(value.operation) || value.operation.kind !== "run" && value.operation.kind !== "judge") throw new Error("ReplayBundle operation must be 'run' or 'judge'.");
  requireSha256$1(value.operation.expectedSha256, "ReplayBundle expected transcript");
  if (value.operation.kind === "run") {
    requireExactKeys(value.operation, [
      "config",
      "expected",
      "expectedSha256",
      "kind"
    ], "run operation");
    const canonicalConfig = canonicalRunConfig(value.operation.config);
    if (JSON.stringify(await toPortableNode(value.operation.config, /* @__PURE__ */ new Map())) !== JSON.stringify(await toPortableNode(canonicalConfig, /* @__PURE__ */ new Map()))) throw new Error("ReplayBundle run config is not canonical.");
    validateDeterministicTranscript(value.operation.expected);
  } else {
    requireExactKeys(value.operation, [
      "expected",
      "expectedSha256",
      "kind",
      "spec"
    ], "judge operation");
    validateSelfContainedJudgeSpec(value.operation.spec);
    validateJudgeTranscript(value.operation.expected);
  }
  if (value.operation.expectedSha256 !== await portableSha256(value.operation.expected)) throw new Error("ReplayBundle expected transcript digest mismatch.");
  await toPortableNode(value, /* @__PURE__ */ new Map());
}
async function replayBundle(host, bundle, options = {}) {
  await assertValidReplayBundle(bundle);
  const mismatches = [];
  let artifact = bundle.artifact;
  let build;
  if (options.recompile ?? true) {
    build = await host.compileProject(structuredClone(bundle.project), { cache: false });
    if (!build.success || !build.artifact) return {
      compatible: false,
      mismatches: ["build"],
      build
    };
    artifact = build.artifact;
    if (await artifactDigest(artifact) !== bundle.artifactSha256) mismatches.push("artifactSha256");
  }
  if (bundle.operation.kind === "run") {
    const run = await host.run(artifact, structuredClone(bundle.operation.config));
    const actual2 = replayRunTranscript(run);
    mismatches.push(...diffPaths(bundle.operation.expected, actual2, "run"));
    return {
      compatible: mismatches.length === 0,
      mismatches: sortedUnique$1(mismatches),
      build,
      run
    };
  }
  const judge = await host.judge(artifact, structuredClone(bundle.operation.spec));
  const actual = judgeTranscript(judge);
  mismatches.push(...diffPaths(bundle.operation.expected, actual, "judge"));
  return {
    compatible: mismatches.length === 0,
    mismatches: sortedUnique$1(mismatches),
    build,
    judge
  };
}
function judgeTranscript(result) {
  return {
    verdict: result.verdict,
    completed: result.completed,
    total: result.total,
    cases: result.cases.map((item) => ({
      id: item.id,
      verdict: item.verdict,
      ...item.message === void 0 ? {} : { message: item.message },
      ...item.run === void 0 ? {} : { run: replayRunTranscript(item.run) },
      ...item.interaction === void 0 ? {} : { interaction: interactionTranscript(item.interaction) }
    })),
    metrics: structuredClone(result.metrics)
  };
}
function interactionTranscript(result) {
  return {
    contestant: structuredClone(result.contestant),
    interactor: structuredClone(result.interactor),
    contestantToInteractor: result.contestantToInteractor,
    interactorToContestant: result.interactorToContestant,
    determinism: structuredClone(result.determinism)
  };
}
function replayRunTranscript(result) {
  const transcript = deterministicTranscript(result);
  if (transcript.trapMessage === void 0) delete transcript.trapMessage;
  return transcript;
}
function canonicalRunConfig(value) {
  if (!isRecord$3(value) || !Array.isArray(value.args) || value.args.some((item) => typeof item !== "string") || typeof value.stdin !== "string" || !isRecord$3(value.env)) throw new Error("ReplayBundle run config is malformed.");
  const env = Object.fromEntries(Object.entries(value.env).sort(([left], [right]) => left.localeCompare(right)).map(([name, entry]) => {
    if (!name || name.includes("=") || name.includes("\0") || typeof entry !== "string" || entry.includes("\0")) throw new Error(`ReplayBundle run environment '${name}' is invalid.`);
    return [name, entry];
  }));
  const files = Object.fromEntries(Object.entries(value.files ?? {}).sort(([left], [right]) => left.localeCompare(right)).map(([path, bytes]) => {
    requireGuestPath(path, "run input file");
    if (!(bytes instanceof Uint8Array)) throw new Error(`ReplayBundle run input '${path}' must be bytes.`);
    return [path, bytes.slice()];
  }));
  const outputPaths = [...value.outputPaths ?? []].map((path) => requireGuestPath(path, "run output file")).sort();
  if (new Set(outputPaths).size !== outputPaths.length) throw new Error("ReplayBundle run output paths must be unique.");
  const cwd = value.cwd === void 0 ? void 0 : requireGuestPath(value.cwd, "run cwd", true);
  return {
    args: [...value.args],
    stdin: value.stdin,
    env,
    files,
    outputPaths,
    ...cwd === void 0 ? {} : { cwd },
    determinism: resolveDeterminism(value.determinism),
    resources: resolveResourcePolicy(value.resources)
  };
}
function validateSelfContainedJudgeSpec(spec) {
  validateJudgeSpec(spec);
  for (const item of spec.cases) {
    requireInlineInput(item.input, `Judge case '${item.id}' stdin`);
    for (const [path, input] of Object.entries(item.files ?? {})) requireInlineFileInput(input, `Judge case '${item.id}' file '${path}'`);
    if (item.kind === "batch" && !SELF_CONTAINED_MATCHERS.has(item.matcher.id)) throw new Error(`Judge matcher '${item.matcher.id}' is not self-contained in a replay bundle.`);
  }
}
function requireInlineInput(input, label) {
  if (input.kind !== "inline") throw new Error(`${label} must be materialized inline for an offline replay bundle.`);
}
function requireInlineFileInput(input, label) {
  if (input.kind !== "inline" && input.kind !== "inline-bytes") throw new Error(`${label} must be materialized inline for an offline replay bundle.`);
}
async function assertOfflineDependencies(value) {
  if (!isRecord$3(value) || value.schema !== WASM_OJ_SCHEMAS.dependencyOfflineBundle || value.wasmOjContract !== WASM_OJ_CONTRACT_VERSION || !isRecord$3(value.payloads)) throw new Error("ReplayBundle dependencies must be a WASM-OJ offline dependency bundle.");
  assertValidDependencyLock(value.lock);
  const lock = value.lock;
  const expected = new Set(lock.packages.map((item) => item.integritySha256));
  const actual = Object.keys(value.payloads).sort();
  if (actual.length !== expected.size || actual.some((digest) => !expected.has(digest))) throw new Error("ReplayBundle dependency payloads do not match their lock.");
  for (const [digest, payload] of Object.entries(value.payloads)) if (!(payload instanceof Uint8Array) || await sha256Hex$1(payload) !== digest) throw new Error(`ReplayBundle dependency '${digest}' failed integrity verification.`);
}
async function portableSha256(value) {
  return sha256Hex$1(JSON.stringify(await toPortableNode(value, /* @__PURE__ */ new Map())));
}
async function toPortableNode(value, blobs, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("ReplayBundle cannot encode non-finite numbers.");
    return Object.is(value, -0) ? 0 : value;
  }
  if (value instanceof Uint8Array) {
    const bytes = value.slice();
    const digest = await sha256Hex$1(bytes);
    const existing = blobs.get(digest);
    if (existing && !equalBytes$1(existing, bytes)) throw new Error("ReplayBundle encountered a SHA-256 collision.");
    blobs.set(digest, bytes);
    return [
      "b",
      digest,
      bytes.byteLength
    ];
  }
  if (typeof value !== "object" || value === void 0) throw new Error("ReplayBundle contains a non-portable value.");
  if (seen.has(value)) throw new Error("ReplayBundle cannot encode cyclic data.");
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.keys(value).length !== value.length) throw new Error("ReplayBundle arrays must be dense.");
      return ["a", await Promise.all(value.map((item) => toPortableNode(item, blobs, seen)))];
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new Error("ReplayBundle objects must be plain data records.");
    const entries = [];
    for (const key of Object.keys(value).sort()) {
      const descriptor2 = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor2?.enumerable || !("value" in descriptor2) || descriptor2.value === void 0) throw new Error(`ReplayBundle field '${key}' is not portable.`);
      entries.push([key, await toPortableNode(descriptor2.value, blobs, seen)]);
    }
    return ["o", entries];
  } finally {
    seen.delete(value);
  }
}
function validateDeterministicTranscript(value) {
  if (!isRecord$3(value) || !Number.isInteger(value.code) || typeof value.stdout !== "string" || typeof value.stderr !== "string" || !isRecord$3(value.files) || typeof value.termination !== "string" || !isRecord$3(value.determinism) || !isRecord$3(value.resources) || !isRecord$3(value.metrics)) throw new Error("ReplayBundle run transcript is malformed.");
  resolveDeterminism(value.determinism);
  resolveResourcePolicy(value.resources);
  for (const [path, hex] of Object.entries(value.files)) {
    requireGuestPath(path, "run transcript file");
    if (typeof hex !== "string" || !/^(?:[0-9a-f]{2})*$/.test(hex)) throw new Error(`Run transcript file '${path}' is not hexadecimal.`);
  }
}
function validateJudgeTranscript(value) {
  if (!isRecord$3(value) || typeof value.verdict !== "string" || !Number.isSafeInteger(value.completed) || !Number.isSafeInteger(value.total) || !Array.isArray(value.cases) || !isRecord$3(value.metrics)) throw new Error("ReplayBundle judge transcript is malformed.");
  for (const item of value.cases) {
    if (!isRecord$3(item) || typeof item.id !== "string" || typeof item.verdict !== "string") throw new Error("ReplayBundle judge case transcript is malformed.");
    if (item.run !== void 0) validateDeterministicTranscript(item.run);
  }
}
function diffPaths(expected, actual, path) {
  if (Object.is(expected, actual)) return [];
  if (expected instanceof Uint8Array && actual instanceof Uint8Array) return equalBytes$1(expected, actual) ? [] : [path];
  if (Array.isArray(expected) && Array.isArray(actual)) {
    const result = [];
    const maximum = Math.max(expected.length, actual.length);
    for (let index = 0; index < maximum && result.length < 128; index += 1) result.push(...diffPaths(expected[index], actual[index], `${path}[${index}]`));
    return result.slice(0, 128);
  }
  if (isRecord$3(expected) && isRecord$3(actual)) {
    const keys = sortedUnique$1([...Object.keys(expected), ...Object.keys(actual)]);
    const result = [];
    for (const key of keys) {
      result.push(...diffPaths(expected[key], actual[key], `${path}.${key}`));
      if (result.length >= 128) break;
    }
    return result.slice(0, 128);
  }
  return [path];
}
function requireGuestPath(value, label, allowRoot = false) {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\") || value.includes("\0") || value.includes("//") || value.split("/").some((part) => part === "." || part === "..") || !allowRoot && value === "/" || value !== "/" && value.endsWith("/")) throw new Error(`ReplayBundle ${label} must be an absolute normalized guest path.`);
  return value;
}
function equalBytes$1(left, right) {
  if (left.byteLength !== right.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
function requireSha256$1(value, label) {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) throw new Error(`${label} SHA-256 is invalid.`);
}
function sortedUnique$1(values) {
  return [...new Set(values)].sort();
}
function requireExactKeys(value, expected, label) {
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`ReplayBundle ${label} contains unexpected fields.`);
}
function isRecord$3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var OperationScheduler = class {
  host;
  observe;
  queue = [];
  identities = /* @__PURE__ */ new Set();
  active;
  disposed = false;
  constructor(host, observe) {
    this.host = host;
    this.observe = observe;
    if (!host || typeof host.executeSubmission !== "function" || typeof host.cancelActiveSubmission !== "function") throw new TypeError("OperationScheduler requires a submission execution host.");
  }
  submit(request) {
    if (this.disposed) throw new WasmOjError("WASM-OJ operation scheduler is disposed.", {
      code: "disposed",
      stage: "operation"
    });
    if (!request || typeof request !== "object") throw new WasmOjError("WASM-OJ submission request must be an object.", {
      code: "invalid-input",
      stage: "operation"
    });
    const id = submissionId(request.id);
    if (this.identities.has(id)) throw new WasmOjError(`WASM-OJ submission operation '${id}' already exists.`, {
      code: "operation-conflict",
      stage: "operation",
      operationId: id
    });
    this.identities.add(id);
    const entry = new SubmissionEntry(id, request, (payload) => this.emit(entry, payload), () => this.cancelEntry(entry));
    this.queue.push(entry);
    entry.emit({
      type: "state",
      state: "queued"
    });
    queueMicrotask(() => void this.drain());
    return entry.operation;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.active) {
      this.active.disposal = true;
      this.active.cancel("WASM-OJ operation scheduler was disposed.");
      this.host.cancelActiveSubmission();
    }
    for (const entry of this.queue.splice(0)) {
      entry.disposal = true;
      entry.cancel("WASM-OJ operation scheduler was disposed.");
      this.settleCancellation(entry);
    }
  }
  hasPending() {
    return this.active !== void 0 || this.queue.some((entry) => !entry.settled);
  }
  cancelActive(reason = "WASM-OJ submission operation was cancelled.") {
    if (!this.active) return false;
    this.active.cancel(reason);
    return true;
  }
  cancelEntry(entry) {
    if (entry.settled) return;
    if (this.active === entry) this.host.cancelActiveSubmission();
    else {
      const index = this.queue.indexOf(entry);
      if (index >= 0) this.queue.splice(index, 1);
      this.settleCancellation(entry);
    }
  }
  async drain() {
    if (this.disposed || this.active) return;
    const entry = this.queue.shift();
    if (!entry) return;
    if (entry.signal.aborted) {
      this.settleCancellation(entry);
      queueMicrotask(() => void this.drain());
      return;
    }
    this.active = entry;
    entry.setState("running");
    try {
      const result = await this.host.executeSubmission({
        ...entry.request,
        id: entry.id,
        signal: entry.signal
      }, entry.emit);
      if (entry.signal.aborted) this.settleCancellation(entry);
      else {
        entry.setState("succeeded");
        entry.resolve(result);
      }
    } catch (error) {
      if (entry.signal.aborted) this.settleCancellation(entry, error);
      else {
        const failure = asWasmOjError(error, {
          code: "internal-failure",
          stage: "operation",
          retryable: false,
          operationId: entry.id
        });
        entry.emit({
          type: "error",
          error: failure.toJSON()
        });
        entry.setState("failed");
        entry.reject(failure);
      }
    } finally {
      entry.cleanup();
      if (this.active === entry) this.active = void 0;
      queueMicrotask(() => void this.drain());
    }
  }
  settleCancellation(entry, cause) {
    if (entry.settled) return;
    const failure = new WasmOjError(entry.cancelReason ?? "WASM-OJ submission operation was cancelled.", {
      code: entry.disposal ? "disposed" : "operation-cancelled",
      stage: "operation",
      operationId: entry.id,
      cause
    });
    entry.emit({
      type: "error",
      error: failure.toJSON()
    });
    entry.setState("cancelled");
    entry.reject(failure);
    entry.cleanup();
  }
  emit(entry, payload) {
    const event = Object.freeze({
      ...payload,
      operationId: entry.id,
      sequence: entry.nextSequence()
    });
    entry.notify(event);
    this.observe?.(event);
  }
};
var SubmissionEntry = class {
  id;
  request;
  controller = new AbortController();
  signal = this.controller.signal;
  operation;
  result;
  emit;
  listeners = /* @__PURE__ */ new Set();
  lastStateEvent;
  externalSignal;
  onExternalAbort;
  sequence = 0;
  currentState = "queued";
  resolveResult;
  rejectResult;
  settled = false;
  disposal = false;
  cancelReason;
  constructor(id, request, emit, cancelEntry) {
    this.id = id;
    this.request = request;
    this.emit = emit;
    this.result = new Promise((resolve, reject) => {
      this.resolveResult = resolve;
      this.rejectResult = reject;
    });
    this.result.catch(() => void 0);
    this.externalSignal = request.signal;
    this.onExternalAbort = () => {
      this.cancel(abortReason(this.externalSignal?.reason));
      cancelEntry();
    };
    if (this.externalSignal?.aborted) this.controller.abort(this.externalSignal.reason);
    else this.externalSignal?.addEventListener("abort", this.onExternalAbort, { once: true });
    this.operation = Object.freeze({
      id,
      kind: "submission",
      signal: this.signal,
      result: this.result,
      state: () => this.currentState,
      cancel: (reason) => {
        this.cancel(reason);
        cancelEntry();
      },
      onEvent: (listener) => {
        if (typeof listener !== "function") throw new TypeError("WASM-OJ operation event listener must be a function.");
        this.listeners.add(listener);
        if (this.lastStateEvent) this.notifyListener(listener, this.lastStateEvent);
        return () => this.listeners.delete(listener);
      }
    });
  }
  cancel(reason) {
    if (this.settled || this.signal.aborted) return;
    this.cancelReason = validCancelReason(reason);
    this.controller.abort(this.cancelReason);
  }
  setState(state) {
    if (this.settled) return;
    this.currentState = state;
    this.emit({
      type: "state",
      state
    });
    if (state === "succeeded" || state === "failed" || state === "cancelled") this.settled = true;
  }
  resolve(result) {
    if (!this.settled) this.settled = true;
    this.resolveResult(result);
  }
  reject(error) {
    if (!this.settled) this.settled = true;
    this.rejectResult(error);
  }
  nextSequence() {
    return this.sequence++;
  }
  notify(event) {
    if (event.type === "state") this.lastStateEvent = event;
    for (const listener of this.listeners) this.notifyListener(listener, event);
  }
  notifyListener(listener, event) {
    try {
      listener(event);
    } catch {
      this.listeners.delete(listener);
    }
  }
  cleanup() {
    this.externalSignal?.removeEventListener("abort", this.onExternalAbort);
  }
};
function submissionId(requested) {
  if (requested === void 0) return crypto.randomUUID();
  if (typeof requested !== "string" || !requested || requested !== requested.trim() || requested.length > 128) throw new WasmOjError("WASM-OJ submission ID must be non-empty, trimmed, and at most 128 characters.", {
    code: "invalid-input",
    stage: "operation"
  });
  return requested;
}
function validCancelReason(reason) {
  if (reason === void 0) return "WASM-OJ submission operation was cancelled.";
  if (typeof reason !== "string" || !reason || reason !== reason.trim() || reason.length > 512) throw new TypeError("WASM-OJ cancellation reason must be non-empty, trimmed, and at most 512 characters.");
  return reason;
}
function abortReason(reason) {
  return typeof reason === "string" && reason && reason === reason.trim() && reason.length <= 512 ? reason : "WASM-OJ submission operation was aborted.";
}
var Engine = class {
  compiler;
  runner;
  artifactStore;
  dependencyManager;
  compilation;
  operationScheduler;
  observationListeners = /* @__PURE__ */ new Set();
  disposed = false;
  cacheClearActive = false;
  cacheClearOperation;
  /** Extensible judge registry for custom input providers and output matchers. */
  judging;
  constructor(options) {
    this.compiler = options.compiler;
    this.runner = options.runner;
    this.artifactStore = options.artifactStore;
    this.dependencyManager = options.dependencyManager;
    this.compilation = new CompileCoordinator(options.compiler, options.artifactStore);
    this.judging = new JudgeEngine(createJudgeExecutor({
      run: (artifact, run) => this.runner.run(artifact, {
        ...run,
        args: [...run.args],
        env: { ...run.env },
        files: Object.fromEntries(Object.entries(run.files).map(([path, contents]) => [path, contents.slice()])),
        outputPaths: [...run.outputPaths]
      }),
      interact: (contestant, interactor, interaction) => this.runner.interact(contestant, interactor, interaction),
      ...this.runner.runTrusted === void 0 ? {} : { runTrusted: (program, run) => this.runner.runTrusted(program, {
        ...run,
        args: [...run.args],
        env: { ...run.env },
        files: Object.fromEntries(Object.entries(run.files).map(([path, contents]) => [path, contents.slice()])),
        outputPaths: [...run.outputPaths]
      }) },
      ...this.runner.interactTrusted === void 0 ? {} : { interactTrusted: (contestant, interactor, interaction) => this.runner.interactTrusted(contestant, interactor, interaction) }
    }), options.judge);
    this.operationScheduler = new OperationScheduler({
      executeSubmission: (request, observe) => this.executeSubmission(request, observe),
      cancelActiveSubmission: () => this.cancelExecution()
    }, (event) => this.notifyObservation(event));
  }
  async ready() {
    this.assertAvailable();
    await stableBoundary(() => Promise.all([this.compiler.ready(), this.runner.ready()]).then(() => void 0), {
      code: "initialization-failure",
      stage: "initialize",
      retryable: false
    });
  }
  onProgress(listener) {
    this.assertActive();
    const removeCompilerListener = this.compiler.onProgress(listener);
    let removeRunnerListener;
    try {
      removeRunnerListener = this.runner.onProgress(listener);
    } catch (error) {
      removeCompilerListener();
      throw error;
    }
    return () => {
      removeCompilerListener();
      removeRunnerListener();
    };
  }
  onStream(listener) {
    this.assertActive();
    return this.runner.onStream(listener);
  }
  /** Subscribe to operation-scoped, structured host observations. */
  onObservation(listener) {
    this.assertActive();
    if (typeof listener !== "function") throw new TypeError("WASM-OJ observation listener must be a function.");
    this.observationListeners.add(listener);
    return () => this.observationListeners.delete(listener);
  }
  /** Enqueue one independently observable and cancellable compile-and-judge submission. */
  submit(request) {
    this.assertActive();
    if (this.cacheClearActive) throw new WasmOjError("Engine is clearing its caches.", {
      code: "operation-conflict",
      stage: "operation",
      retryable: true
    });
    stableInput(() => {
      createSdkProject(request?.input);
      validateJudgeSpec(request?.spec);
      compileCacheRequested(request?.compile ?? {});
    }, "operation");
    return this.operationScheduler.submit(request);
  }
  /** Resolve and cache one canonical dependency graph using this host's adapters. */
  async resolveDependencies(manifest, options) {
    this.assertActive();
    const dependencyManager = this.dependencyManager;
    if (!dependencyManager) throw new WasmOjError("Engine has no dependency manager.", {
      code: "unsupported",
      stage: "dependency"
    });
    return stableBoundary(() => dependencyManager.resolve(manifest, options), {
      code: "dependency-failure",
      stage: "dependency",
      retryable: true
    });
  }
  /** Materialize a lock into the archive-independent compiler input contract. */
  async prepareDependencies(lock, adapters) {
    this.assertActive();
    const dependencyManager = this.dependencyManager;
    if (!dependencyManager) throw new WasmOjError("Engine has no dependency manager.", {
      code: "unsupported",
      stage: "dependency"
    });
    return stableBoundary(() => dependencyManager.prepareBuild(lock, adapters), {
      code: "dependency-failure",
      stage: "dependency",
      retryable: false
    });
  }
  async compile(input, options = {}) {
    this.assertAvailable();
    const { project, cache } = stableInput(() => ({
      project: createSdkProject(input),
      cache: compileCacheRequested(options)
    }), "compile");
    return stableBoundary(() => this.compilation.compile(project, { cache: this.artifactStore !== void 0 && cache }), {
      code: "compiler-failure",
      stage: "compile",
      retryable: true
    });
  }
  /** Compile an already-normalized Project without reconstructing its library identity. */
  async compileProject(project, options = {}) {
    this.assertAvailable();
    const { normalized, cache } = stableInput(() => {
      assertValidProject(project);
      return {
        normalized: structuredClone(project),
        cache: compileCacheRequested(options)
      };
    }, "compile");
    return stableBoundary(() => this.compilation.compile(normalized, { cache: this.artifactStore !== void 0 && cache }), {
      code: "compiler-failure",
      stage: "compile",
      retryable: true
    });
  }
  async replay(bundle, options) {
    this.assertAvailable();
    stableInput(() => assertValidReplayBundle(bundle), "replay");
    return stableBoundary(() => replayBundle(this, bundle, options), {
      code: "replay-failure",
      stage: "replay",
      retryable: false
    });
  }
  /** Compile during idle time; a matching foreground compile joins this exact request. */
  async precompile(input) {
    this.assertAvailable();
    const project = stableInput(() => createSdkProject(input), "compile");
    return stableBoundary(() => this.compilation.precompile(project), {
      code: "compiler-failure",
      stage: "compile",
      retryable: true
    });
  }
  /** Supersede only speculative work; a foreground build is never cancelled here. */
  supersedePrecompile() {
    if (this.disposed || this.cacheClearActive) return;
    this.compilation.supersedeBackground();
  }
  async run(artifact, options = {}) {
    this.assertAvailable();
    const request = stableInput(() => {
      assertValidBuildArtifact(artifact);
      return {
        args: runStringArray(options.args, "Run arguments"),
        stdin: optionalString(options.stdin, "Run stdin") ?? "",
        env: runEnvironment(options.env),
        files: Object.fromEntries(runFileEntries(options.files).map(([path, contents]) => [path, typeof contents === "string" ? new TextEncoder().encode(contents) : contents.slice()])),
        outputPaths: runStringArray(options.outputPaths, "Run output paths"),
        ...options.cwd === void 0 ? {} : { cwd: optionalString(options.cwd, "Run cwd") },
        determinism: resolveDeterminism(options.determinism),
        resources: resolveResourcePolicy(options.resources)
      };
    }, "run");
    return stableBoundary(() => this.runner.run(artifact, request), {
      code: "runner-failure",
      stage: "run",
      retryable: true
    });
  }
  async interact(contestant, interactor, options = {}) {
    this.assertAvailable();
    const request = stableInput(() => {
      assertValidBuildArtifact(contestant);
      assertValidBuildArtifact(interactor);
      return {
        contestant: interactiveProgramConfig(options.contestant),
        interactor: interactiveProgramConfig(options.interactor),
        determinism: resolveDeterminism(options.determinism)
      };
    }, "run");
    return stableBoundary(() => this.runner.interact(contestant, interactor, request), {
      code: "runner-failure",
      stage: "run",
      retryable: true
    });
  }
  async judge(artifact, spec, options) {
    this.assertAvailable();
    stableInput(() => {
      assertValidBuildArtifact(artifact);
      validateJudgeSpec(spec);
    }, "judge");
    return stableBoundary(() => this.judging.judge(artifact, spec, options), {
      code: "judge-failure",
      stage: "judge",
      retryable: false
    });
  }
  async judgeProject(input, spec, compile = {}, judge) {
    this.assertAvailable();
    const build = await this.compile(input, compile);
    if (!build.success || !build.artifact) return { build };
    return {
      build,
      judge: await this.judge(build.artifact, spec, judge)
    };
  }
  async execute(input, run = {}, compile = {}) {
    this.assertAvailable();
    const build = await this.compile(input, compile);
    if (!build.success || !build.artifact) return { build };
    return {
      build,
      run: await this.run(build.artifact, run)
    };
  }
  cancel() {
    if (this.disposed || this.cacheClearActive) return;
    if (!this.operationScheduler.cancelActive()) this.cancelExecution();
  }
  restart() {
    this.assertAvailable();
    this.compilation.restart();
    this.runner.restart();
  }
  clearCache() {
    this.assertActive();
    if (this.cacheClearOperation) return this.cacheClearOperation;
    if (this.operationScheduler.hasPending()) throw new WasmOjError("Engine cannot clear caches while submission operations are pending.", {
      code: "operation-conflict",
      stage: "storage",
      retryable: true
    });
    this.cacheClearActive = true;
    const operation = stableBoundary(() => this.clearCacheOperationInternal(), {
      code: "storage-failure",
      stage: "storage",
      retryable: true
    });
    this.cacheClearOperation = operation;
    operation.finally(() => {
      if (this.cacheClearOperation === operation) {
        this.cacheClearOperation = void 0;
        this.cacheClearActive = false;
      }
    }).catch(() => void 0);
    return operation;
  }
  async clearCacheOperationInternal() {
    await Promise.all([this.compilation.cancelAndWait(), this.runner.cancelAndWait()]);
    this.assertActive();
    await Promise.all([
      this.compiler.clearToolchainCache(),
      this.runner.clearRuntimeCache(),
      this.artifactStore?.clear(),
      this.dependencyManager?.clearCache()
    ]);
  }
  dispose() {
    if (this.disposed) return;
    this.operationScheduler.dispose();
    this.disposed = true;
    this.compilation.dispose();
    this.runner.dispose();
    this.observationListeners.clear();
  }
  assertActive() {
    if (this.disposed) throw new WasmOjError("Engine is disposed.", {
      code: "disposed",
      stage: "operation"
    });
  }
  assertAvailable() {
    this.assertActive();
    if (this.cacheClearActive) throw new WasmOjError("Engine is clearing its caches.", {
      code: "operation-conflict",
      stage: "operation",
      retryable: true
    });
    if (this.operationScheduler.hasPending()) throw new WasmOjError("Direct Engine operations are unavailable while submission operations are pending.", {
      code: "operation-conflict",
      stage: "operation",
      retryable: true
    });
  }
  cancelExecution() {
    this.compilation.cancel();
    this.runner.cancel();
  }
  async executeSubmission(request, observe) {
    this.assertActive();
    const removeCompilerProgress = this.compiler.onProgress((progress) => observe({
      type: "progress",
      progress
    }));
    const removeRunnerProgress = this.runner.onProgress((progress) => observe({
      type: "progress",
      progress
    }));
    const removeStream = this.runner.onStream((stream, chunk) => observe({
      type: "stream",
      stream,
      chunk
    }));
    try {
      if (request.signal?.aborted) throw request.signal.reason;
      let build;
      try {
        const project = createSdkProject(request.input);
        build = await this.compilation.compile(project, { cache: this.artifactStore !== void 0 && compileCacheRequested(request.compile ?? {}) });
      } catch (error) {
        throw asWasmOjError(error, {
          code: "compiler-failure",
          stage: "compile",
          retryable: true,
          operationId: request.id
        });
      }
      observe({
        type: "build",
        success: build.success,
        cacheHit: build.cacheHit,
        diagnosticCount: build.diagnostics.length,
        ...build.artifact === void 0 ? {} : { artifact: {
          id: build.artifact.id,
          kind: build.artifact.kind,
          size: build.artifact.size
        } }
      });
      if (!build.success || !build.artifact) return { build };
      try {
        const judge = await this.judging.judge(build.artifact, request.spec, {
          ...request.judge,
          onCase: (result, completed, total) => {
            observe({
              type: "case",
              caseId: result.id,
              verdict: result.verdict,
              ...result.message === void 0 ? {} : { message: result.message },
              completed,
              total
            });
          }
        });
        return {
          build,
          judge
        };
      } catch (error) {
        throw asWasmOjError(error, {
          code: "judge-failure",
          stage: "judge",
          retryable: false,
          operationId: request.id
        });
      }
    } finally {
      removeCompilerProgress();
      removeRunnerProgress();
      removeStream();
    }
  }
  notifyObservation(event) {
    for (const listener of this.observationListeners) try {
      listener(event);
    } catch {
      this.observationListeners.delete(listener);
    }
  }
};
function interactiveProgramConfig(options = {}) {
  return {
    args: runStringArray(options.args, "Interactive arguments"),
    env: runEnvironment(options.env),
    files: Object.fromEntries(runFileEntries(options.files).map(([path, contents]) => [path, typeof contents === "string" ? new TextEncoder().encode(contents) : contents.slice()])),
    ...options.cwd === void 0 ? {} : { cwd: optionalString(options.cwd, "Interactive cwd") },
    resources: resolveResourcePolicy(options.resources)
  };
}
function compileCacheRequested(options) {
  dataRecord(options, "Compile options");
  if (options.cache !== void 0 && typeof options.cache !== "boolean") throw new TypeError("Compile cache option must be a boolean.");
  return options.cache ?? true;
}
function runStringArray(value, label) {
  if (value === void 0) return [];
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return value.map((item, index) => {
    if (typeof item !== "string" || item.includes("\0")) throw new TypeError(`${label} entry ${index} must be a NUL-free string.`);
    return item;
  });
}
function optionalString(value, label) {
  if (value === void 0) return void 0;
  if (typeof value !== "string") throw new TypeError(`${label} must be a string.`);
  return value;
}
function runEnvironment(value) {
  if (value === void 0) return {};
  const environment = dataRecord(value, "Run environment");
  const result = {};
  for (const [name, entry] of Object.entries(environment)) {
    if (!name || name.includes("=") || name.includes("\0")) throw new TypeError(`Run environment variable name '${name}' is invalid.`);
    if (typeof entry !== "string" || entry.includes("\0")) throw new TypeError(`Run environment variable '${name}' must be a NUL-free string.`);
    result[name] = entry;
  }
  return result;
}
function runFileEntries(value) {
  if (value === void 0) return [];
  const files = dataRecord(value, "Run files");
  return Object.entries(files).map(([path, contents]) => {
    if (typeof contents !== "string" && !(contents instanceof Uint8Array)) throw new TypeError(`Run file '${path}' must be a string or Uint8Array.`);
    return [path, contents];
  });
}
function dataRecord(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be a plain object.`);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError(`${label} must be a plain object.`);
  for (const [key, descriptor2] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!descriptor2.enumerable) continue;
    if (!("value" in descriptor2)) throw new TypeError(`${label} property '${key}' must be plain data.`);
  }
  return value;
}
async function stableBoundary(operation, options) {
  try {
    return await operation();
  } catch (error) {
    throw asWasmOjError(error, options);
  }
}
function stableInput(operation, stage) {
  try {
    return operation();
  } catch (error) {
    throw asWasmOjError(error, {
      code: "invalid-input",
      stage,
      retryable: false
    });
  }
}
var WASM_OJ_LIBCXX_PCH_HEADER = `#pragma once
#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <cctype>
#include <cerrno>
#include <cfloat>
#include <charconv>
#include <chrono>
#include <climits>
#include <cmath>
#include <compare>
#include <concepts>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <exception>
#include <functional>
#include <iomanip>
#include <ios>
#include <iostream>
#include <iterator>
#include <limits>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <random>
#include <ranges>
#include <set>
#include <span>
#include <sstream>
#include <stack>
#include <string>
#include <string_view>
#include <tuple>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
`;
var decoder = new TextDecoder();
function isToolchainLibcxxPchHeader(contents) {
  return contents === WASM_OJ_LIBCXX_PCH_HEADER;
}
Object.freeze({
  c: "cpp",
  cpp: "cpp",
  rust: "cargo",
  python: "pypi",
  javascript: "npm",
  typescript: "npm",
  go: "go"
});
`${GO_VERSION.split(".").slice(0, 2).join(".")}`;
Object.freeze({
  version: GO_VERSION,
  target: "wasip1/wasm",
  packageAsset: GO_PACKAGE_ASSET_PATH,
  packageCompressedSha256: GO_COMPRESSED_PACKAGE_SHA256,
  packageSha256: GO_PACKAGE_SHA256,
  manifestAsset: GO_PACKAGE_MANIFEST_ASSET_PATH,
  manifestSha256: GO_PACKAGE_MANIFEST_SHA256,
  standardLibraryAsset: GO_STANDARD_LIBRARY_ASSET_PATH,
  standardLibraryCompressedSha256: GO_COMPRESSED_STANDARD_LIBRARY_SHA256,
  standardLibrarySha256: GO_STANDARD_LIBRARY_SHA256,
  compilerSha256: GO_COMPILER_SHA256,
  linkerSha256: GO_LINKER_SHA256
});
String.raw`
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#ifdef __cplusplus
extern "C" {
#endif

static uint32_t wasm_oj_random_state;
static int wasm_oj_initialized;

static uint64_t wasm_oj_parse_u64(const char *value) {
    if (!value || !*value) abort();
    uint64_t result = 0;
    for (const unsigned char *cursor = (const unsigned char *)value; *cursor; ++cursor) {
        if (*cursor < '0' || *cursor > '9') abort();
        uint64_t digit = (uint64_t)(*cursor - '0');
        if (result > (UINT64_MAX - digit) / 10) abort();
        result = result * 10 + digit;
    }
    return result;
}

static void wasm_oj_initialize(void) {
    if (wasm_oj_initialized) return;
    uint64_t seed = wasm_oj_parse_u64(getenv("WASM_OJ_RANDOM_SEED"));
    wasm_oj_random_state = (uint32_t)seed;
    wasm_oj_initialized = 1;
}

static uint32_t wasm_oj_next_u32(void) {
    wasm_oj_random_state += 0x9e3779b9u;
    uint32_t value = wasm_oj_random_state;
    value ^= value >> 16;
    value *= 0x21f0aaadu;
    value ^= value >> 15;
    value *= 0x735a2d97u;
    value ^= value >> 15;
    return value;
}

uint32_t __imported_wasi_snapshot_preview1_random_get(uint8_t *buffer, size_t length) {
    wasm_oj_initialize();
    uint32_t word = 0;
    for (size_t index = 0; index < length; ++index) {
        if ((index & 3u) == 0) word = wasm_oj_next_u32();
        buffer[index] = (uint8_t)(word >> ((index & 3u) * 8u));
    }
    return 0;
}

#ifdef __cplusplus
}
#endif
`;
String.raw`
import os as _os
import runpy as _runpy
import sys as _sys

_random_state = None

def _random_seed():
    global _random_state
    if _random_state is None:
        _random_state = int(_os.environ["WASM_OJ_RANDOM_SEED"]) & 0xffffffff
    return _random_state

def _next_u32():
    global _random_state
    _random_seed()
    _random_state = (_random_state + 0x9e3779b9) & 0xffffffff
    value = _random_state
    value ^= value >> 16
    value = (value * 0x21f0aaad) & 0xffffffff
    value ^= value >> 15
    value = (value * 0x735a2d97) & 0xffffffff
    value ^= value >> 15
    return value & 0xffffffff

def _urandom(length):
    if not isinstance(length, int) or length < 0:
        raise ValueError("negative argument not allowed")
    output = bytearray(length)
    word = 0
    for index in range(length):
        if index % 4 == 0:
            word = _next_u32()
        output[index] = (word >> ((index % 4) * 8)) & 0xff
    return bytes(output)

_os.urandom = _urandom
if hasattr(_os, "getrandom"):
    _os.getrandom = lambda size, flags=0: _urandom(size)

_entry = _sys.argv[1]
_sys.argv = [_entry, *_sys.argv[2:]]
_sys.path[0] = _os.path.dirname(_entry)
_runpy.run_path(_entry, run_name="__main__")
`;
new TextEncoder().encode("WOJFS002");
var PYTHON_RUNTIME_FILES_CACHE_KEY = `${WASM_OJ_STORAGE.runtimeFilesCache}:cpython-3.14.7-wasip1-stdlib-stored-zip`;
var PYTHON_RUNTIME_FILES_EXPORT_SCRIPT = String.raw`
import io
import os
import sys
import zipfile

source_root = "/usr/local/lib/python3.14"
guest_path = "/cpython/lib/python314.zip"
output = sys.stdout.buffer
output.write(b"WOJFS002")

archive_buffer = io.BytesIO()
with zipfile.ZipFile(archive_buffer, "w", compression=zipfile.ZIP_STORED) as archive:
    for root, directories, files in os.walk(source_root):
        directories[:] = sorted(
            name for name in directories
            if name != "__pycache__" and not os.path.islink(os.path.join(root, name))
        )
        for name in sorted(files):
            source_path = os.path.join(root, name)
            if os.path.islink(source_path) or name.endswith((".pyc", ".pyo")):
                continue
            archive_path = os.path.relpath(source_path, source_root).replace(os.sep, "/")
            info = zipfile.ZipInfo(archive_path, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED
            info.external_attr = 0o100644 << 16
            with open(source_path, "rb") as source:
                archive.writestr(info, source.read())

encoded_path = guest_path.encode("utf-8")
archive_data = archive_buffer.getvalue()
output.write(len(encoded_path).to_bytes(4, "little"))
output.write(len(archive_data).to_bytes(8, "little"))
output.write(encoded_path)
output.write(archive_data)

output.write((0).to_bytes(4, "little"))
output.write((0).to_bytes(8, "little"))
`;
var encoder = new TextEncoder();
var RUN_INPUT_LIMITS = Object.freeze({
  files: 256,
  bytesPerFile: 67108864,
  totalBytes: 134217728,
  stdinBytes: 67108864
});
var PREPARED_MOUNT_LIMITS = Object.freeze({
  files: 32768,
  bytesPerFile: 268435456,
  totalBytes: 536870912
});
var PROBLEM_STARTER_LIMITS = Object.freeze({
  filesPerLanguage: 128,
  bytesPerFile: 262144,
  totalBytesPerLanguage: 1048576
});
Object.freeze({
  provider: "github",
  owner: "wasm-oj",
  repository: "problems",
  ref: "main",
  indexPath: "collection/index.json"
});
var UTF8_ENCODER = new TextEncoder();
var WASM_OJ_JUDGE_PACKAGE_MAGIC = "WOJJDG02";
var MAGIC = new TextEncoder().encode(WASM_OJ_JUDGE_PACKAGE_MAGIC);
var HEADER_BYTES = MAGIC.byteLength + 4 + 4;
var SHA256_INITIAL = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA256_CONSTANTS = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var issuedDownloadBudgets = /* @__PURE__ */ new WeakSet();
function createDependencyDownloadBudget(limitBytes = DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes) {
  if (!Number.isSafeInteger(limitBytes) || limitBytes < 1 || limitBytes > DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes) throw new RangeError(`Dependency download budget must be 1-${DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes} bytes.`);
  let usedBytes = 0;
  const add = (bytes) => {
    if (!Number.isSafeInteger(bytes) || bytes < 0) throw new TypeError("Dependency download byte reservation is invalid.");
    if (usedBytes + bytes > limitBytes) throw new RangeError(`Dependency downloads exceed the ${limitBytes}-byte aggregate limit.`);
    usedBytes += bytes;
  };
  const budget = Object.freeze({
    get limitBytes() {
      return limitBytes;
    },
    get usedBytes() {
      return usedBytes;
    },
    reserve(bytes) {
      add(bytes);
    },
    consume(bytes) {
      add(bytes);
    },
    release(bytes) {
      if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > usedBytes) throw new TypeError("Dependency download byte release is invalid.");
      usedBytes -= bytes;
    }
  });
  issuedDownloadBudgets.add(budget);
  return budget;
}
function assertDependencyDownloadBudget(value) {
  if (!value || typeof value !== "object" || !issuedDownloadBudgets.has(value)) throw new TypeError("Dependency download budget must be issued by WASM-OJ.");
  const budget = value;
  if (!Number.isSafeInteger(budget.limitBytes) || budget.limitBytes < 1 || budget.limitBytes > DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes || !Number.isSafeInteger(budget.usedBytes) || budget.usedBytes < 0 || budget.usedBytes > budget.limitBytes) throw new TypeError("Dependency download budget state is invalid.");
}
var IP_V4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
var PRIVATE_SUFFIXES = [
  "home.arpa",
  "internal",
  "intranet",
  "lan",
  "local",
  "localhost"
];
function publicDependencyUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Dependency URL '${value}' is invalid.`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error(`Dependency URL '${value}' must be credential-free HTTPS without a query or fragment.`);
  dependencyPublicHostname(url.hostname);
  return url;
}
function dependencyPublicHostname(value) {
  const hostname = value.toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname !== value.toLowerCase().replace(/\.$/, "")) throw new Error(`Dependency hostname '${value}' is invalid.`);
  if (isIpLiteral(hostname)) throw new Error(`Dependency hostname '${value}' must not be an IP literal.`);
  if (PRIVATE_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) throw new Error(`Dependency hostname '${value}' is a local or private-network endpoint.`);
  let canonical;
  try {
    canonical = new URL(`https://${hostname}/`);
  } catch {
    throw new Error(`Dependency hostname '${value}' is invalid.`);
  }
  const normalized = canonical.hostname.toLowerCase().replace(/\.$/, "");
  if (normalized !== hostname || canonical.port || canonical.username || canonical.password) throw new Error(`Dependency hostname '${value}' must be a canonical DNS hostname.`);
  return normalized;
}
function isIpLiteral(hostname) {
  const unwrapped = hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
  return IP_V4.test(unwrapped) || unwrapped.includes(":");
}
var DIGEST = /^[0-9a-f]{64}$/;
function normalizeDependencyNetworkAccess(access) {
  if (!access || typeof access !== "object") throw new TypeError("Dependency network access is required.");
  const scope = normalizeDependencyNetworkScope(access);
  if (!Array.isArray(access.hosts) || access.hosts.length === 0) throw new TypeError("Dependency network access must declare the complete non-empty host set.");
  assertBoundedCount(access.hosts.length, DEPENDENCY_RESOLUTION_LIMITS.hosts, "Dependency network hosts");
  return Object.freeze({
    sourceKey: scope.sourceKey,
    bundleDigest: scope.bundleDigest,
    hosts: normalizedHosts(access.hosts)
  });
}
function normalizeDependencyNetworkScope(scope) {
  if (!scope || typeof scope !== "object") throw new TypeError("Dependency network scope is required.");
  const { sourceKey, bundleDigest } = scope;
  if (typeof sourceKey !== "string" || !sourceKey || sourceKey.length > 2048 || sourceKey !== sourceKey.trim() || sourceKey.includes("\0")) throw new TypeError("Dependency network source key is invalid.");
  if (typeof bundleDigest !== "string" || !DIGEST.test(bundleDigest)) throw new TypeError("Dependency network bundle digest must be lowercase SHA-256 hexadecimal.");
  return Object.freeze({
    sourceKey,
    bundleDigest
  });
}
function normalizedHosts(values) {
  const hosts = [...new Set(values.map((host) => {
    if (typeof host !== "string") throw new TypeError("Dependency network hosts must be strings.");
    return dependencyPublicHostname(host);
  }))].sort();
  assertBoundedCount(hosts.length, DEPENDENCY_RESOLUTION_LIMITS.hosts, "Dependency network hosts");
  return hosts;
}
var SHA256 = /^[0-9a-f]{64}$/;
var DEFAULT_MAX_METADATA_BYTES = DEPENDENCY_RESOLUTION_LIMITS.metadataBytes;
var DEFAULT_MAX_PACKAGE_BYTES = DEPENDENCY_RESOLUTION_LIMITS.packageBytes;
var DEFAULT_MAX_UNPACKED_BYTES = DEPENDENCY_RESOLUTION_LIMITS.unpackedBytes;
var DependencyNetworkError = class extends Error {
  constructor(hostname, options) {
    super(`Dependency network request to '${hostname}' failed before an HTTP response.`, options);
    this.name = "DependencyNetworkError";
  }
};
function createDefaultDependencyResolvers(options = {}) {
  const resolved = resolveOptions(options);
  return [
    new CargoLockDependencyResolver(resolved),
    new NpmLockDependencyResolver(resolved),
    new PyPiLockDependencyResolver(resolved),
    new GoLockDependencyResolver(resolved),
    new CppLockDependencyResolver(resolved)
  ];
}
var CargoLockDependencyResolver = class {
  ecosystem = "cargo";
  options;
  constructor(options = {}) {
    this.options = isResolvedOptions(options) ? options : resolveOptions(options);
  }
  async resolve(manifest, context) {
    const parsed = parseCargoLock(requireSource(manifest, "cargo", "lockfile", "Cargo.lock").contents);
    assertBoundedCount(parsed.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "Cargo.lock packages");
    const external = parsed.filter((item) => item.source !== void 0);
    const byName = groupBy(external, (item) => item.name);
    const roots = manifest.requirements.map((requirement) => {
      const version = exactVersion(requirement, true);
      const matches = (byName.get(requirement.name) ?? []).filter((item) => item.version === version);
      if (matches.length !== 1) throw new Error(`Cargo.lock must contain exactly one '${requirement.name} ${version}' package.`);
      return packageId("cargo", matches[0].name, matches[0].version);
    });
    const packageIds = new Map(external.map((item) => [cargoIdentity(item.name, item.version, item.source), packageId("cargo", item.name, item.version)]));
    const network = await authorizeDependencyNetwork(this.options, context);
    const downloadBudget = resolutionDownloadBudget(context);
    return graph(roots, await mapLimited(external, this.options.concurrency, async (item) => {
      if (!isCratesIoSource(item.source)) throw new Error(`Cargo package '${item.name} ${item.version}' uses unsupported source '${item.source}'.`);
      if (!item.checksum || !SHA256.test(item.checksum)) throw new Error(`Cargo package '${item.name} ${item.version}' is missing a SHA-256 checksum.`);
      const url = new URL(`${encodeURIComponent(item.name)}/${encodeURIComponent(item.name)}-${encodeURIComponent(item.version)}.crate`, this.options.cargoCrateBaseUrl).href;
      const payload = await fetchBytes(this.options, network, url, this.options.maxPackageBytes, downloadBudget);
      const digest = await sha256Hex$1(payload);
      if (digest !== item.checksum) throw integrityError("Cargo", item.name, item.version);
      const dependencies = item.dependencies.map((reference) => {
        const target = resolveCargoDependency(reference, external);
        const id = packageIds.get(cargoIdentity(target.name, target.version, target.source));
        if (!id) throw new Error(`Cargo dependency '${reference}' is not an external locked package.`);
        return id;
      });
      return {
        record: {
          id: packageId("cargo", item.name, item.version),
          ecosystem: "cargo",
          name: item.name,
          version: item.version,
          source: item.source,
          integritySha256: digest,
          dependencies: sortedUnique(dependencies),
          ...featuresForRoot(manifest.requirements, item.name, item.version)
        },
        payload
      };
    }));
  }
};
var NpmLockDependencyResolver = class {
  ecosystem = "npm";
  options;
  constructor(options = {}) {
    this.options = isResolvedOptions(options) ? options : resolveOptions(options);
  }
  async resolve(manifest, context) {
    const lock = parseJson(requireSource(manifest, "npm", "lockfile", "package-lock.json").contents, "package-lock.json");
    if (lock.lockfileVersion !== 2 && lock.lockfileVersion !== 3) throw new Error("npm adapter requires package-lock.json lockfileVersion 2 or 3.");
    if (!isRecord(lock.packages) || !isRecord(lock.packages[""])) throw new Error("package-lock.json must contain its root packages entry.");
    const lockPackages = lock.packages;
    const packageEntryPaths = Object.keys(lockPackages).filter((path) => path !== "");
    assertBoundedCount(packageEntryPaths.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "package-lock.json packages");
    const entries = packageEntryPaths.map((path) => [path, lockPackages[path]]).map(([path, value]) => parseNpmEntry(path, value));
    const entryByPath = new Map(entries.map((entry) => [entry.path, entry]));
    const rootEntry = lockPackages[""];
    const roots = manifest.requirements.map((requirement) => {
      const rootSpec = npmRootSpec(rootEntry, requirement.name);
      if (rootSpec !== void 0 && rootSpec !== requirement.requirement) throw new Error(`package-lock.json root requirement for '${requirement.name}' does not match '${requirement.requirement}'.`);
      const entry = entryByPath.get(`node_modules/${requirement.name}`);
      if (!entry) throw new Error(`package-lock.json does not contain root package '${requirement.name}'.`);
      return packageId("npm", entry.name, entry.version);
    });
    const network = await authorizeDependencyNetwork(this.options, context);
    const downloadBudget = resolutionDownloadBudget(context);
    return graph(roots, deduplicatePackages(await mapLimited(entries, this.options.concurrency, async (entry) => {
      const payload = await fetchBytes(this.options, network, entry.resolved, this.options.maxPackageBytes, downloadBudget);
      await verifySri(payload, entry.integrity, `npm package '${entry.name}@${entry.version}'`);
      const dependencies = Object.keys(entry.dependencies).map((name) => {
        const target = resolveNpmDependency(entry.path, name, entryByPath);
        return packageId("npm", target.name, target.version);
      });
      const digest = await sha256Hex$1(payload);
      return {
        record: {
          id: packageId("npm", entry.name, entry.version),
          ecosystem: "npm",
          name: entry.name,
          version: entry.version,
          source: entry.resolved,
          integritySha256: digest,
          dependencies: sortedUnique(dependencies)
        },
        payload
      };
    })));
  }
};
var PyPiLockDependencyResolver = class {
  ecosystem = "pypi";
  options;
  constructor(options = {}) {
    this.options = isResolvedOptions(options) ? options : resolveOptions(options);
  }
  async resolve(manifest, context) {
    const locked = parsePythonRequirements(requireSource(manifest, "pypi", "lockfile", "requirements.txt").contents);
    assertBoundedCount(locked.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "requirements.txt packages");
    const byName = new Map(locked.map((item) => [item.name, item]));
    const roots = manifest.requirements.map((requirement) => {
      const name = normalizePythonName(requirement.name);
      const version = exactPythonVersion(requirement);
      const item = byName.get(name);
      if (!item || item.version !== version) throw new Error(`requirements.txt must lock '${requirement.name}==${version}' with SHA-256.`);
      return packageId("pypi", name, version);
    });
    const network = await authorizeDependencyNetwork(this.options, context);
    const downloadBudget = resolutionDownloadBudget(context);
    return graph(roots, await mapLimited(locked, this.options.concurrency, async (item) => {
      const metadataUrl = new URL(`${encodeURIComponent(item.name)}/${encodeURIComponent(item.version)}/json`, this.options.pypiApiUrl).href;
      const file = selectPyPiFile(parseJson(new TextDecoder().decode(await fetchBytes(this.options, network, metadataUrl, this.options.maxMetadataBytes, downloadBudget)), `PyPI metadata for ${item.name}`), item.hashes, item.name, item.version);
      const payload = await fetchBytes(this.options, network, file.url, this.options.maxPackageBytes, downloadBudget);
      const digest = await sha256Hex$1(payload);
      if (!item.hashes.has(digest)) throw integrityError("PyPI", item.name, item.version);
      return {
        record: {
          id: packageId("pypi", item.name, item.version),
          ecosystem: "pypi",
          name: item.name,
          version: item.version,
          source: file.url,
          integritySha256: digest,
          dependencies: []
        },
        payload
      };
    }));
  }
};
var GoLockDependencyResolver = class {
  ecosystem = "go";
  options;
  constructor(options = {}) {
    this.options = isResolvedOptions(options) ? options : resolveOptions(options);
  }
  async resolve(manifest, context) {
    const goMod = requireSource(manifest, "go", "manifest", "go.mod");
    const goSum = requireSource(manifest, "go", "lockfile", "go.sum");
    const required = parseGoMod(goMod.contents);
    assertBoundedCount(required.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "go.mod packages");
    const sums = parseGoSum(goSum.contents);
    const byPath = new Map(required.map((item) => [item.name, item]));
    const roots = manifest.requirements.map((requirement) => {
      const version = exactVersion(requirement, false);
      const item = byPath.get(requirement.name);
      if (!item || item.version !== version) throw new Error(`go.mod must require '${requirement.name} ${version}'.`);
      return packageId("go", item.name, item.version);
    });
    const network = await authorizeDependencyNetwork(this.options, context);
    const downloadBudget = resolutionDownloadBudget(context);
    return graph(roots, await mapLimited(required, this.options.concurrency, async (item) => {
      const expected = sums.get(`${item.name} ${item.version}`);
      if (!expected) throw new Error(`go.sum is missing '${item.name} ${item.version}' module content hash.`);
      const url = new URL(`${escapeGoPath(item.name)}/@v/${escapeGoPath(item.version)}.zip`, this.options.goProxyUrl).href;
      const payload = await fetchBytes(this.options, network, url, this.options.maxPackageBytes, downloadBudget);
      if (await goModuleZipHash(payload, this.options.maxUnpackedBytes) !== expected) throw integrityError("Go", item.name, item.version);
      return {
        record: {
          id: packageId("go", item.name, item.version),
          ecosystem: "go",
          name: item.name,
          version: item.version,
          source: url,
          integritySha256: await sha256Hex$1(payload),
          dependencies: []
        },
        payload
      };
    }));
  }
};
var CppLockDependencyResolver = class {
  ecosystem = "cpp";
  options;
  constructor(options = {}) {
    this.options = isResolvedOptions(options) ? options : resolveOptions(options);
  }
  async resolve(manifest, context) {
    const lock = parseCppLock(parseJson(requireSource(manifest, "cpp", "lockfile", "wasm-oj-cpp.lock.json").contents, "wasm-oj-cpp.lock.json"));
    const records = new Map(lock.packages.map((item) => [`${item.name}@${item.version}`, item]));
    for (const requirement of manifest.requirements) {
      const version = exactVersion(requirement, false);
      if (!records.has(`${requirement.name}@${version}`)) throw new Error(`wasm-oj-cpp.lock.json must contain '${requirement.name}@${version}'.`);
    }
    const requiredRoots = sortedUnique(manifest.requirements.map((item) => `${item.name}@${exactVersion(item, false)}`));
    if (JSON.stringify(requiredRoots) !== JSON.stringify(lock.roots)) throw new Error("wasm-oj-cpp.lock.json roots do not exactly match the C/C++ dependency manifest.");
    const network = await authorizeDependencyNetwork(this.options, context);
    const downloadBudget = resolutionDownloadBudget(context);
    const packages = await mapLimited(lock.packages, this.options.concurrency, async (item) => {
      const payload = await fetchBytes(this.options, network, item.url, this.options.maxPackageBytes, downloadBudget);
      const digest = await sha256Hex$1(payload);
      if (digest !== item.sha256) throw integrityError("C/C++", item.name, item.version);
      return {
        record: {
          id: packageId("cpp", item.name, item.version),
          ecosystem: "cpp",
          name: item.name,
          version: item.version,
          source: item.url,
          integritySha256: digest,
          dependencies: item.dependencies.map((dependency) => {
            if (!records.has(dependency)) throw new Error(`C/C++ package '${item.name}' refers to missing '${dependency}'.`);
            const split = splitNameVersion(dependency);
            return packageId("cpp", split.name, split.version);
          })
        },
        payload
      };
    });
    return graph(lock.roots.map((root) => {
      const split = splitNameVersion(root);
      return packageId("cpp", split.name, split.version);
    }), packages);
  }
};
async function goModuleZipHash(payload, maxUnpackedBytes = DEFAULT_MAX_UNPACKED_BYTES, maxFiles = DEPENDENCY_RESOLUTION_LIMITS.archiveFiles) {
  boundedPositiveInteger(maxUnpackedBytes, DEPENDENCY_RESOLUTION_LIMITS.unpackedBytes, "Go module unpacked byte limit");
  boundedPositiveInteger(maxFiles, DEPENDENCY_RESOLUTION_LIMITS.archiveFiles, "Go module file limit");
  let files;
  let rejected;
  let headerBytes = 0;
  let headerFiles = 0;
  const namesSeen = /* @__PURE__ */ new Set();
  try {
    files = unzipSync(payload, { filter(file) {
      try {
        validateZipPath(file.name);
        if (namesSeen.has(file.name)) throw new Error(`Go module ZIP contains duplicate path '${file.name}'.`);
        namesSeen.add(file.name);
        headerFiles += 1;
        if (headerFiles > maxFiles) throw new RangeError(`Go module ZIP exceeds the ${maxFiles}-file limit.`);
        if (!Number.isSafeInteger(file.originalSize) || file.originalSize < 0) throw new Error("Go module ZIP has invalid uncompressed size metadata.");
        headerBytes += file.originalSize;
        if (!Number.isSafeInteger(headerBytes) || headerBytes > maxUnpackedBytes) throw new RangeError("Go module ZIP exceeds the unpacked byte limit.");
        return true;
      } catch (error) {
        rejected = error instanceof Error ? error : /* @__PURE__ */ new Error("Go module ZIP preflight failed.");
        throw rejected;
      }
    } });
  } catch (error) {
    if (rejected) throw rejected;
    throw new Error("Go module payload is not a valid ZIP archive.", { cause: error });
  }
  const names = Object.keys(files).sort();
  if (!names.length) throw new Error("Go module ZIP is empty.");
  if (names.length !== headerFiles) throw new Error("Go module ZIP entry inventory changed during extraction.");
  let unpacked = 0;
  let summary = "";
  for (const name of names) {
    validateZipPath(name);
    const bytes = files[name];
    unpacked += bytes.byteLength;
    if (unpacked > maxUnpackedBytes) throw new Error("Go module ZIP exceeds the unpacked byte limit.");
    summary += `${await sha256Hex$1(bytes)}  ${name}
`;
  }
  return `h1:${bytesToBase64(await digestBytes("SHA-256", new TextEncoder().encode(summary)))}`;
}
function resolveOptions(options) {
  const fetcher = options.fetch ?? globalThis.fetch;
  if (typeof fetcher !== "function") throw new Error("Dependency adapters require a Fetch-compatible implementation.");
  return {
    fetch: fetcher.bind(globalThis),
    classifyPlatformFetchRejections: options.fetch === void 0,
    ...options.networkAuthorizer === void 0 ? {} : { networkAuthorizer: options.networkAuthorizer },
    maxMetadataBytes: boundedPositiveInteger(options.maxMetadataBytes ?? DEFAULT_MAX_METADATA_BYTES, DEPENDENCY_RESOLUTION_LIMITS.metadataBytes, "metadata byte limit"),
    maxPackageBytes: boundedPositiveInteger(options.maxPackageBytes ?? DEFAULT_MAX_PACKAGE_BYTES, DEPENDENCY_RESOLUTION_LIMITS.packageBytes, "package byte limit"),
    maxUnpackedBytes: boundedPositiveInteger(options.maxUnpackedBytes ?? DEFAULT_MAX_UNPACKED_BYTES, DEPENDENCY_RESOLUTION_LIMITS.unpackedBytes, "unpacked byte limit"),
    concurrency: boundedPositiveInteger(options.concurrency ?? 6, DEPENDENCY_RESOLUTION_LIMITS.concurrency, "dependency concurrency"),
    cargoCrateBaseUrl: baseUrl(options.cargoCrateBaseUrl ?? "https://static.crates.io/crates/"),
    pypiApiUrl: baseUrl(options.pypiApiUrl ?? "https://pypi.org/pypi/"),
    goProxyUrl: baseUrl(options.goProxyUrl ?? "https://proxy.golang.org/")
  };
}
async function authorizeDependencyNetwork(options, context) {
  if (!options.networkAuthorizer) throw new Error("Dependency network access requires an explicit authorizer.");
  const access = normalizeDependencyNetworkAccess(context.networkAccess);
  await options.networkAuthorizer.authorize(access);
  return new Set(access.hosts);
}
function isResolvedOptions(value) {
  return "maxMetadataBytes" in value && "maxPackageBytes" in value && "fetch" in value && "classifyPlatformFetchRejections" in value && "cargoCrateBaseUrl" in value && "goProxyUrl" in value;
}
function dependencyTransportFailure(options, hostname, cause) {
  if (cause instanceof DependencyNetworkError) throw cause;
  if (options.classifyPlatformFetchRejections && cause instanceof TypeError) throw new DependencyNetworkError(hostname, { cause });
  throw cause;
}
async function fetchBytes(options, authorizedHosts, rawUrl, maximum, budget) {
  if (!budget) throw new Error("Dependency download budget is required.");
  const parsed = publicDependencyUrl(rawUrl);
  if (!authorizedHosts.has(parsed.hostname)) throw new Error(`Dependency host '${parsed.hostname}' is outside the explicitly authorized host set.`);
  const url = parsed.href;
  let response;
  try {
    response = await options.fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "manual"
    });
  } catch (cause) {
    dependencyTransportFailure(options, parsed.hostname, cause);
  }
  if (response.type === "opaqueredirect" || response.redirected || response.status >= 300 && response.status < 400) throw new Error(`Dependency fetch redirected unexpectedly for '${url}'.`);
  if (!response.ok) throw new Error(`Dependency fetch failed with HTTP ${response.status} for '${url}'.`);
  const declared = response.headers.get("content-length");
  const declaredBytes = declared === null ? void 0 : Number(declared);
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(declaredBytes) || declaredBytes > maximum)) throw new Error(`Dependency response for '${url}' exceeds the ${maximum}-byte limit.`);
  let reserved = 0;
  let length = 0;
  if (declaredBytes !== void 0) {
    try {
      budget.reserve(declaredBytes);
    } catch (error) {
      try {
        await response.body?.cancel("Dependency response exceeded its aggregate byte limit.");
      } catch {
      }
      throw error;
    }
    reserved = declaredBytes;
  }
  try {
    if (!response.body) {
      let bytes;
      try {
        bytes = new Uint8Array(await response.arrayBuffer());
      } catch (cause) {
        dependencyTransportFailure(options, parsed.hostname, cause);
      }
      if (bytes.byteLength > maximum) throw new Error(`Dependency response for '${url}' exceeds the ${maximum}-byte limit.`);
      if (bytes.byteLength > reserved) {
        budget.consume(bytes.byteLength - reserved);
        reserved = bytes.byteLength;
      }
      length = bytes.byteLength;
      return bytes;
    }
    const reader = response.body.getReader();
    const chunks = [];
    try {
      while (true) {
        let chunk;
        try {
          chunk = await reader.read();
        } catch (cause) {
          dependencyTransportFailure(options, parsed.hostname, cause);
        }
        const { done, value } = chunk;
        if (done) break;
        const next = length + value.byteLength;
        if (!Number.isSafeInteger(next) || next > maximum) {
          await reader.cancel("Dependency response exceeded its byte limit.");
          throw new Error(`Dependency response for '${url}' exceeds the ${maximum}-byte limit.`);
        }
        if (next > reserved) try {
          budget.consume(next - reserved);
          reserved = next;
        } catch (error) {
          await reader.cancel("Dependency response exceeded its aggregate byte limit.");
          throw error;
        }
        length = next;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  } finally {
    if (reserved > length) budget.release(reserved - length);
  }
}
function requireSource(manifest, ecosystem, role, basename) {
  const matches = (manifest.sourceFiles ?? []).filter((file) => file.ecosystem === ecosystem && file.role === role && file.path.split("/").at(-1) === basename);
  if (matches.length !== 1) throw new Error(`${ecosystem} adapter requires exactly one ${basename} ${role}.`);
  return matches[0];
}
function parseCargoLock(contents) {
  const version = contents.match(/^version\s*=\s*(\d+)\s*$/m)?.[1];
  if (version !== "3" && version !== "4") throw new Error("Cargo adapter requires Cargo.lock format version 3 or 4.");
  const blocks = contents.split(/^\[\[package\]\]\s*$/m).slice(1);
  if (!blocks.length) throw new Error("Cargo.lock does not contain packages.");
  assertBoundedCount(blocks.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "Cargo.lock packages");
  return blocks.map((block) => {
    return {
      name: cargoString(block, "name", true),
      version: cargoString(block, "version", true),
      source: cargoString(block, "source", false),
      checksum: cargoString(block, "checksum", false),
      dependencies: cargoStringArray(block, "dependencies")
    };
  });
}
function cargoString(block, key, required) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*("(?:[^"\\\\]|\\\\.)*")\\s*$`, "m"));
  if (!match) {
    if (required) throw new Error(`Cargo.lock package is missing '${key}'.`);
    return;
  }
  return parseJson(match[1], `Cargo.lock ${key}`);
}
function cargoStringArray(block, key) {
  const start = block.match(new RegExp(`^${key}\\s*=\\s*\\[`, "m"));
  if (!start || start.index === void 0) return [];
  const bracket = block.indexOf("[", start.index);
  const end = block.indexOf("]", bracket + 1);
  if (end < 0) throw new Error(`Cargo.lock package has an unterminated '${key}' array.`);
  const parsed = parseJson(block.slice(bracket, end + 1).replace(/,\s*]/, "]"), `Cargo.lock ${key}`);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) throw new Error(`Cargo.lock '${key}' must be a string array.`);
  assertBoundedCount(parsed.length, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, `Cargo.lock '${key}' references`);
  return parsed;
}
function resolveCargoDependency(reference, packages) {
  const match = reference.match(/^(\S+)(?:\s+(\S+))?(?:\s+\((.+)\))?$/);
  if (!match) throw new Error(`Invalid Cargo.lock dependency reference '${reference}'.`);
  const candidates = packages.filter((item) => item.name === match[1] && (match[2] === void 0 || item.version === match[2]) && (match[3] === void 0 || item.source === match[3]));
  if (candidates.length !== 1) throw new Error(`Cargo.lock dependency '${reference}' is ambiguous or missing.`);
  return candidates[0];
}
function cargoIdentity(name, version, source) {
  return `${name}\0${version}\0${source}`;
}
function isCratesIoSource(source) {
  return source === "registry+https://github.com/rust-lang/crates.io-index" || source === "sparse+https://index.crates.io/";
}
function parseNpmEntry(path, value) {
  if (!isRecord(value)) throw new Error(`package-lock.json entry '${path}' must be an object.`);
  if (value.link === true) throw new Error(`package-lock.json link entry '${path}' is not portable.`);
  return {
    path,
    name: typeof value.name === "string" ? value.name : npmNameFromPath(path),
    version: requireText(value.version, `npm version for '${path}'`),
    resolved: requireHttpsUrl(requireText(value.resolved, `npm resolved URL for '${path}'`)),
    integrity: requireText(value.integrity, `npm integrity for '${path}'`),
    dependencies: value.dependencies === void 0 ? {} : stringRecord(value.dependencies, `npm dependencies for '${path}'`)
  };
}
function npmNameFromPath(path) {
  const index = path.lastIndexOf("node_modules/");
  if (index < 0) throw new Error(`Cannot derive an npm package name from '${path}'.`);
  const parts = path.slice(index + 13).split("/");
  return parts[0].startsWith("@") ? `${parts[0]}/${parts[1] ?? ""}` : parts[0];
}
function npmRootSpec(root, name) {
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies"
  ]) if (isRecord(root[field]) && typeof root[field][name] === "string") return root[field][name];
}
function resolveNpmDependency(path, name, entries) {
  let parent = path;
  while (true) {
    const candidate = entries.get(parent ? `${parent}/node_modules/${name}` : `node_modules/${name}`);
    if (candidate) return candidate;
    const marker = parent.lastIndexOf("/node_modules/");
    if (marker < 0) parent = "";
    else parent = parent.slice(0, marker);
    if (!parent) {
      const root = entries.get(`node_modules/${name}`);
      if (root) return root;
      break;
    }
  }
  throw new Error(`package-lock.json cannot resolve '${name}' from '${path}'.`);
}
async function verifySri(payload, integrity, label) {
  const candidates = integrity.split(/\s+/).map((item) => item.split("?", 1)[0]).map((item) => {
    const separator = item.indexOf("-");
    return separator < 0 ? void 0 : {
      algorithm: item.slice(0, separator),
      digest: item.slice(separator + 1)
    };
  }).filter((item) => item !== void 0).filter((item) => [
    "sha256",
    "sha384",
    "sha512"
  ].includes(item.algorithm));
  if (!candidates.length) throw new Error(`${label} has no supported SRI digest.`);
  for (const candidate of candidates) if (constantTimeEqual(bytesToBase64(await digestBytes(candidate.algorithm.toUpperCase().replace("SHA", "SHA-"), payload)), candidate.digest)) return;
  throw new Error(`${label} failed SRI verification.`);
}
function parsePythonRequirements(contents) {
  const logical = contents.replace(/\\\r?\n/g, " ").split(/\r?\n/);
  const result = [];
  const names = /* @__PURE__ */ new Set();
  for (const raw of logical) {
    const line = raw.replace(/\s+#.*$/, "").trim();
    if (!line) continue;
    const match = line.match(/^([A-Za-z0-9._-]+)==([^\s;]+)((?:\s+--hash=sha256:[0-9a-fA-F]{64})+)$/);
    if (!match) throw new Error(`requirements.txt entry must be exact and hash-locked: '${line}'.`);
    const name = normalizePythonName(match[1]);
    if (names.has(name)) throw new Error(`requirements.txt contains duplicate package '${name}'.`);
    names.add(name);
    const hashes = /* @__PURE__ */ new Set();
    for (const item of match[3].matchAll(/--hash=sha256:([0-9a-fA-F]{64})/g)) {
      hashes.add(item[1].toLowerCase());
      assertBoundedCount(hashes.size, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, `requirements.txt hashes for '${name}'`);
    }
    result.push({
      name,
      version: match[2],
      hashes
    });
    assertBoundedCount(result.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "requirements.txt packages");
  }
  if (!result.length) throw new Error("requirements.txt does not contain hash-locked packages.");
  return result.sort((left, right) => left.name.localeCompare(right.name));
}
function normalizePythonName(name) {
  return name.toLowerCase().replace(/[-_.]+/g, "-");
}
function exactPythonVersion(requirement) {
  const match = requirement.requirement.match(/^==([^\s;]+)$/);
  if (!match) throw new Error(`PyPI requirement '${requirement.name}' must use an exact == version.`);
  return match[1];
}
function selectPyPiFile(metadata, hashes, name, version) {
  if (!isRecord(metadata) || !Array.isArray(metadata.urls)) throw new Error(`PyPI metadata for '${name}' has no release files.`);
  assertBoundedCount(metadata.urls.length, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, `PyPI release files for '${name}'`);
  const candidates = metadata.urls.flatMap((value) => {
    if (!isRecord(value) || value.yanked === true || !isRecord(value.digests) || typeof value.digests.sha256 !== "string" || !hashes.has(value.digests.sha256.toLowerCase()) || typeof value.url !== "string" || typeof value.filename !== "string") return [];
    const portableWheel = /-(?:py3|py2\.py3)-none-any\.whl$/i.test(value.filename);
    const sdist = value.packagetype === "sdist" && /\.(?:tar\.gz|zip)$/i.test(value.filename);
    if (!portableWheel && !sdist) return [];
    return [{
      url: requireHttpsUrl(value.url),
      filename: value.filename,
      rank: portableWheel ? 0 : 1
    }];
  });
  candidates.sort((left, right) => left.rank - right.rank || left.filename.localeCompare(right.filename));
  if (!candidates[0]) throw new Error(`PyPI package '${name}==${version}' has no hash-approved portable wheel or sdist.`);
  return { url: candidates[0].url };
}
function parseGoMod(contents) {
  if (/^\s*replace\s/m.test(contents)) throw new Error("Go replace directives are not portable and are not accepted by the deterministic adapter.");
  const result = [];
  let inRequire = false;
  for (const raw of contents.split(/\r?\n/)) {
    const line = raw.replace(/\/\/.*$/, "").trim();
    if (!line) continue;
    if (line === "require (") {
      inRequire = true;
      continue;
    }
    if (inRequire && line === ")") {
      inRequire = false;
      continue;
    }
    const value = inRequire ? line : line.startsWith("require ") ? line.slice(8).trim() : void 0;
    if (value === void 0) continue;
    const parts = value.split(/\s+/);
    if (parts.length !== 2) throw new Error(`Unsupported go.mod require entry '${value}'.`);
    result.push({
      name: parts[0],
      version: parts[1]
    });
    assertBoundedCount(result.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "go.mod packages");
  }
  if (inRequire) throw new Error("go.mod has an unterminated require block.");
  const keys = result.map((item) => item.name);
  if (new Set(keys).size !== keys.length) throw new Error("go.mod contains duplicate module requirements.");
  return result.sort((left, right) => left.name.localeCompare(right.name));
}
function parseGoSum(contents) {
  const result = /* @__PURE__ */ new Map();
  for (const raw of contents.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length !== 3 || !parts[2].startsWith("h1:")) throw new Error(`Invalid go.sum entry '${line}'.`);
    if (parts[1].endsWith("/go.mod")) continue;
    const key = `${parts[0]} ${parts[1]}`;
    if (result.has(key)) throw new Error(`go.sum contains duplicate module hash '${key}'.`);
    result.set(key, parts[2]);
    assertBoundedCount(result.size, DEPENDENCY_RESOLUTION_LIMITS.packages, "go.sum module hashes");
  }
  return result;
}
function escapeGoPath(value) {
  if (!value || value.includes("\\") || value.includes("..")) throw new Error(`Invalid Go module path or version '${value}'.`);
  return value.replace(/[A-Z]/g, (character) => `!${character.toLowerCase()}`);
}
function parseCppLock(value) {
  if (!isRecord(value) || value.schema !== WASM_OJ_SCHEMAS.cppDependencyLock || !Array.isArray(value.roots) || !Array.isArray(value.packages)) throw new Error("wasm-oj-cpp.lock.json does not use the active WASM-OJ C/C++ dependency schema.");
  assertBoundedCount(value.roots.length, DEPENDENCY_RESOLUTION_LIMITS.roots, "C/C++ dependency roots");
  assertBoundedCount(value.packages.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "C/C++ locked packages");
  const roots = sortedUnique(value.roots.map((item) => requireText(item, "C/C++ dependency root")));
  const packages = value.packages.map((raw) => {
    if (!isRecord(raw)) throw new Error("C/C++ locked package must be an object.");
    const name = requireText(raw.name, "C/C++ package name");
    const version = requireText(raw.version, "C/C++ package version");
    const url = requireHttpsUrl(requireText(raw.url, "C/C++ package URL"));
    const sha256 = requireText(raw.sha256, "C/C++ package SHA-256").toLowerCase();
    if (!SHA256.test(sha256)) throw new Error(`C/C++ package '${name}' has an invalid SHA-256.`);
    if (Array.isArray(raw.dependencies)) assertBoundedCount(raw.dependencies.length, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, "C/C++ package dependencies");
    return {
      name,
      version,
      url,
      sha256,
      dependencies: raw.dependencies === void 0 ? [] : sortedUnique(stringArray(raw.dependencies, "C/C++ dependencies"))
    };
  }).sort((left, right) => `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`));
  const ids = packages.map((item) => `${item.name}@${item.version}`);
  if (new Set(ids).size !== ids.length) throw new Error("wasm-oj-cpp.lock.json contains duplicate packages.");
  if (roots.some((root) => !ids.includes(root))) throw new Error("wasm-oj-cpp.lock.json contains an unknown root package.");
  return {
    schema: WASM_OJ_SCHEMAS.cppDependencyLock,
    roots,
    packages
  };
}
function graph(roots, packages) {
  const payloads = {};
  for (const item of packages) payloads[item.record.id] = item.payload;
  return {
    roots: sortedUnique(roots),
    packages: packages.map((item) => item.record).sort((left, right) => left.id.localeCompare(right.id)),
    payloads
  };
}
function deduplicatePackages(items) {
  const result = /* @__PURE__ */ new Map();
  for (const item of items) {
    const existing = result.get(item.record.id);
    if (existing) {
      if (JSON.stringify(existing.record) !== JSON.stringify(item.record) || !constantTimeEqualBytes(existing.payload, item.payload)) throw new Error(`Multiple npm install locations disagree for '${item.record.id}'.`);
    } else result.set(item.record.id, item);
  }
  return [...result.values()];
}
function featuresForRoot(requirements, name, version) {
  const requirement = requirements.find((item) => item.name === name && exactVersion(item, true) === version);
  return requirement?.features?.length ? { features: sortedUnique(requirement.features) } : {};
}
function exactVersion(requirement, allowEquals) {
  const pattern = allowEquals ? /^=?([^\s<>=~^*,]+)$/ : /^([^\s<>=~^*,]+)$/;
  const match = requirement.requirement.match(pattern);
  if (!match) throw new Error(`${requirement.ecosystem} requirement '${requirement.name}' must use an exact version.`);
  return match[1];
}
function splitNameVersion(value) {
  const index = value.lastIndexOf("@");
  if (index <= 0 || index === value.length - 1) throw new Error(`Invalid locked package reference '${value}'.`);
  return {
    name: value.slice(0, index),
    version: value.slice(index + 1)
  };
}
function packageId(ecosystem, name, version) {
  return `${ecosystem}:${name}@${version}`;
}
function requireHttpsUrl(value) {
  return publicDependencyUrl(value).href;
}
function baseUrl(value) {
  const url = requireHttpsUrl(value);
  return url.endsWith("/") ? url : `${url}/`;
}
function parseJson(value, label) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}
function requireText(value, label, maximum = 4096) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > maximum || value.includes("\0")) throw new Error(`${label} must be a non-empty, trimmed, NUL-free string of at most ${maximum} characters.`);
  return value;
}
function stringArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value.map((item) => requireText(item, label));
}
function stringRecord(value, label) {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
  assertBoundedCount(Object.keys(value).length, DEPENDENCY_RESOLUTION_LIMITS.referencesPerPackage, label);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, requireText(item, label)]));
}
function sortedUnique(values) {
  return [...new Set(values)].sort();
}
function groupBy(items, key) {
  const result = /* @__PURE__ */ new Map();
  for (const item of items) {
    const value = key(item);
    const group = result.get(value) ?? [];
    group.push(item);
    result.set(value, group);
  }
  return result;
}
async function mapLimited(items, concurrency, operation) {
  const result = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      result[index] = await operation(items[index]);
    }
  }));
  return result;
}
async function digestBytes(algorithm, value) {
  const copy = value.slice();
  return new Uint8Array(await crypto.subtle.digest(algorithm, copy));
}
function bytesToBase64(bytes) {
  let value = "";
  for (let index = 0; index < bytes.length; index += 32768) value += String.fromCharCode(...bytes.subarray(index, index + 32768));
  return btoa(value);
}
function constantTimeEqual(left, right) {
  const maximum = Math.max(left.length, right.length);
  let different = left.length ^ right.length;
  for (let index = 0; index < maximum; index += 1) different |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  return different === 0;
}
function constantTimeEqualBytes(left, right) {
  const maximum = Math.max(left.length, right.length);
  let different = left.length ^ right.length;
  for (let index = 0; index < maximum; index += 1) different |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return different === 0;
}
function validateZipPath(path) {
  if (!path || path.length > 4096 || path.startsWith("/") || path.includes("\\") || path.split("/").includes("..") || path.includes("\0")) throw new Error(`Go module ZIP contains unsafe path '${path}'.`);
}
function resolutionDownloadBudget(context) {
  const budget = context.downloadBudget ?? createDependencyDownloadBudget();
  assertDependencyDownloadBudget(budget);
  return budget;
}
function positiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${label} must be a positive safe integer.`);
  return value;
}
function boundedPositiveInteger(value, maximum, label) {
  positiveInteger(value, label);
  if (value > maximum) throw new RangeError(`${label} exceeds the ${maximum} hard limit.`);
  return value;
}
function integrityError(ecosystem, name, version) {
  return /* @__PURE__ */ new Error(`${ecosystem} package '${name}@${version}' failed integrity verification.`);
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var DependencyManager = class {
  cache;
  resolvers = /* @__PURE__ */ new Map();
  constructor(cache, resolvers = []) {
    this.cache = cache;
    for (const resolver of resolvers) this.registerResolver(resolver);
  }
  registerResolver(resolver) {
    if (!resolver || typeof resolver !== "object" || typeof resolver.resolve !== "function") throw new TypeError("Dependency resolvers must be objects implementing resolve().");
    if (this.resolvers.has(resolver.ecosystem)) throw new Error(`A dependency resolver is already registered for '${resolver.ecosystem}'.`);
    this.resolvers.set(resolver.ecosystem, resolver);
  }
  async resolve(manifest, options = {}) {
    assertValidDependencyManifest(manifest);
    if (options.previousLock) assertValidDependencyLock(options.previousLock);
    const manifestSha256 = await dependencyManifestSha256(manifest);
    if (options.offline) {
      if (!options.previousLock) throw new Error("Offline dependency resolution requires a previous lock.");
      if (options.previousLock.manifestSha256 !== manifestSha256) throw new Error("Offline dependency lock does not match the requested manifest.");
      await this.verifyCached(options.previousLock);
      return structuredClone(options.previousLock);
    }
    try {
      return await this.resolveOnline(manifest, manifestSha256, options);
    } catch (error) {
      if (!(error instanceof DependencyNetworkError) || !options.previousLock || !options.previousLockNetworkScope || !options.networkAccess || options.previousLock.manifestSha256 !== manifestSha256) throw error;
      const previousScope = normalizeDependencyNetworkScope(options.previousLockNetworkScope);
      const currentScope = normalizeDependencyNetworkAccess(options.networkAccess);
      if (previousScope.sourceKey !== currentScope.sourceKey || previousScope.bundleDigest !== currentScope.bundleDigest) throw error;
      await this.verifyCached(options.previousLock);
      return structuredClone(options.previousLock);
    }
  }
  async resolveOnline(manifest, manifestSha256, options) {
    const downloadBudget = createDependencyDownloadBudget();
    const groups = /* @__PURE__ */ new Map();
    for (const requirement of manifest.requirements) {
      const group = groups.get(requirement.ecosystem) ?? [];
      group.push(requirement);
      groups.set(requirement.ecosystem, group);
    }
    const roots = [];
    const packages = /* @__PURE__ */ new Map();
    let payloadBytes = 0;
    for (const [ecosystem, requirements] of groups) {
      const resolver = this.resolvers.get(ecosystem);
      if (!resolver) throw new Error(`No dependency resolver is registered for '${ecosystem}'.`);
      const graph2 = await resolver.resolve({
        requirements,
        sourceFiles: manifest.sourceFiles?.filter((file) => file.ecosystem === ecosystem)
      }, {
        previousLock: options.previousLock,
        ...options.networkAccess === void 0 ? {} : { networkAccess: options.networkAccess },
        downloadBudget
      });
      if (!Array.isArray(graph2.roots) || !Array.isArray(graph2.packages) || !graph2.payloads || typeof graph2.payloads !== "object" || Array.isArray(graph2.payloads)) throw new TypeError(`Resolver '${ecosystem}' returned an invalid graph.`);
      assertBoundedCount(graph2.roots.length, DEPENDENCY_RESOLUTION_LIMITS.roots, `Resolver '${ecosystem}' roots`);
      assertBoundedCount(graph2.packages.length, DEPENDENCY_RESOLUTION_LIMITS.packages, `Resolver '${ecosystem}' packages`);
      assertBoundedCount(roots.length + graph2.roots.length, DEPENDENCY_RESOLUTION_LIMITS.roots, "Resolved dependency roots");
      const graphIds = new Set(graph2.packages.map((item) => item.id));
      if (graphIds.size !== graph2.packages.length) throw new Error(`Resolver '${ecosystem}' returned duplicate dependency packages.`);
      const newPackageIds = [...graphIds].filter((id) => !packages.has(id));
      assertBoundedCount(packages.size + newPackageIds.length, DEPENDENCY_RESOLUTION_LIMITS.packages, "Resolved dependency packages");
      const unexpected = boundedOwnKeys(graph2.payloads, DEPENDENCY_RESOLUTION_LIMITS.packages, "Resolved dependency payloads").filter((id) => !graphIds.has(id));
      if (unexpected.length) throw new Error(`Resolver returned payloads for unknown packages: ${unexpected.sort().join(", ")}.`);
      for (const item of graph2.packages) {
        const payload = graph2.payloads[item.id];
        if (!(payload instanceof Uint8Array)) throw new Error(`Resolver omitted payload for dependency '${item.id}'.`);
        payloadBytes = admitPayloadBytes(payloadBytes, payload, `Resolved dependency '${item.id}'`);
      }
      for (const root of graph2.roots) roots.push(root);
      for (const item of graph2.packages) {
        const existing = packages.get(item.id);
        if (existing && JSON.stringify(existing) !== JSON.stringify(item)) throw new Error(`Resolvers returned conflicting records for dependency '${item.id}'.`);
        packages.set(item.id, item);
        const payload = graph2.payloads[item.id];
        if (!(payload instanceof Uint8Array)) throw new Error(`Resolver omitted payload for dependency '${item.id}'.`);
        if (await sha256Hex$1(payload) !== item.integritySha256) throw new Error(`Resolver returned corrupt payload for dependency '${item.id}'.`);
        await this.cache.save(item.integritySha256, payload);
      }
    }
    return createDependencyLock(manifestSha256, roots.sort(), [...packages.values()]);
  }
  async verifyCached(lock) {
    assertValidDependencyLock(lock);
    let payloadBytes = 0;
    for (const item of lock.packages) {
      const payload = await this.cache.load(item.integritySha256);
      if (!payload) throw new Error(`Dependency '${item.id}' is absent from the content cache.`);
      payloadBytes = admitPayloadBytes(payloadBytes, payload, `Cached dependency '${item.id}'`);
      if (await sha256Hex$1(payload) !== item.integritySha256) {
        await this.cache.delete(item.integritySha256);
        throw new Error(`Cached dependency '${item.id}' failed integrity verification.`);
      }
    }
  }
  clearCache() {
    return this.cache.clear();
  }
  /** Returns package-ID keyed payloads after re-verifying the content-addressed cache. */
  async materialize(lock) {
    assertValidDependencyLock(lock);
    const payloads = /* @__PURE__ */ new Map();
    let payloadBytes = 0;
    for (const item of lock.packages) {
      const payload = await this.cache.load(item.integritySha256);
      if (!payload) throw new Error(`Dependency '${item.id}' is absent from the content cache.`);
      payloadBytes = admitPayloadBytes(payloadBytes, payload, `Cached dependency '${item.id}'`);
      if (await sha256Hex$1(payload) !== item.integritySha256) {
        await this.cache.delete(item.integritySha256);
        throw new Error(`Cached dependency '${item.id}' failed integrity verification.`);
      }
      payloads.set(item.id, payload);
    }
    return payloads;
  }
  /** Resolve cached archives into the verified, compiler-facing file-tree contract. */
  async prepareBuild(lock, adapters = createDefaultDependencyBuildAdapters()) {
    return createDependencyBuildBundle(lock, await this.materialize(lock), adapters);
  }
  async exportOffline(lock) {
    assertValidDependencyLock(lock);
    const payloads = {};
    let payloadBytes = 0;
    for (const item of lock.packages) {
      const payload = await this.cache.load(item.integritySha256);
      if (!payload) throw new Error(`Dependency '${item.id}' is absent from the content cache.`);
      payloadBytes = admitPayloadBytes(payloadBytes, payload, `Cached dependency '${item.id}'`);
      if (await sha256Hex$1(payload) !== item.integritySha256) {
        await this.cache.delete(item.integritySha256);
        throw new Error(`Cached dependency '${item.id}' failed integrity verification.`);
      }
      payloads[item.integritySha256] = payload;
    }
    return {
      schema: WASM_OJ_SCHEMAS.dependencyOfflineBundle,
      wasmOjContract: WASM_OJ_CONTRACT_VERSION,
      lock: structuredClone(lock),
      payloads
    };
  }
  async importOffline(bundle) {
    if (!bundle || typeof bundle !== "object" || bundle.schema !== WASM_OJ_SCHEMAS.dependencyOfflineBundle || bundle.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw new Error("Offline dependency bundle does not use the active WASM-OJ contract.");
    assertValidDependencyLock(bundle.lock);
    if (!bundle.payloads || typeof bundle.payloads !== "object" || Array.isArray(bundle.payloads)) throw new TypeError("Offline dependency bundle payloads must be a digest-keyed object.");
    const expected = new Set(bundle.lock.packages.map((item) => item.integritySha256));
    const actual = boundedOwnKeys(bundle.payloads, DEPENDENCY_RESOLUTION_LIMITS.packages, "Offline dependency payloads").sort();
    if (actual.length !== expected.size || actual.some((digest) => !expected.has(digest))) throw new Error("Offline dependency bundle payload set does not match its lock.");
    const verified = [];
    let payloadBytes = 0;
    for (const [digest, payload] of Object.entries(bundle.payloads)) {
      requireSha256(digest);
      if (!(payload instanceof Uint8Array)) throw new Error(`Offline dependency payload '${digest}' is invalid.`);
      payloadBytes = admitPayloadBytes(payloadBytes, payload, `Offline dependency '${digest}'`);
      if (await sha256Hex$1(payload) !== digest) throw new Error(`Offline dependency payload '${digest}' failed integrity verification.`);
      verified.push([digest, payload]);
    }
    for (const [digest, payload] of verified) await this.cache.save(digest, payload);
    return structuredClone(bundle.lock);
  }
};
function createDefaultDependencyManager(cache, options = {}) {
  return new DependencyManager(cache, createDefaultDependencyResolvers(options));
}
function admitPayloadBytes(current, payload, label) {
  if (payload.byteLength > DEPENDENCY_RESOLUTION_LIMITS.packageBytes) throw new RangeError(`${label} exceeds the ${DEPENDENCY_RESOLUTION_LIMITS.packageBytes}-byte package limit.`);
  const next = current + payload.byteLength;
  if (!Number.isSafeInteger(next) || next > DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes) throw new RangeError(`Dependency payloads exceed the ${DEPENDENCY_RESOLUTION_LIMITS.totalDownloadBytes}-byte aggregate limit.`);
  return next;
}
function boundedOwnKeys(value, maximum, label) {
  const keys = [];
  for (const key in value) {
    if (!Object.hasOwn(value, key)) continue;
    keys.push(key);
    if (keys.length > maximum) throw new RangeError(`${label} exceeds the ${maximum}-item limit.`);
  }
  return keys;
}
function requireSha256(value) {
  if (!/^[0-9a-f]{64}$/.test(value)) throw new Error("Dependency integrity must be lowercase SHA-256 hexadecimal.");
}
var programs = [
  {
    language: "c",
    entry: "main.c",
    source: '#include <stdio.h>\nint main(){int c;while((c=getchar())!=EOF)printf("%02x",(unsigned)c);puts("");return 0;}'
  },
  {
    language: "cpp",
    entry: "main.cpp",
    source: '#include <iostream>\n#include <cstdio>\nint main(){char c;while(std::cin.get(c))printf("%02x",(unsigned char)c);puts("");}'
  },
  {
    language: "python",
    entry: "main.py",
    source: "import sys\nprint(sys.stdin.buffer.read().hex())\n"
  },
  {
    language: "rust",
    entry: "main.rs",
    source: 'use std::io::{self,Read};fn main(){let mut b=Vec::new();io::stdin().read_to_end(&mut b).unwrap();for x in b{print!("{:02x}",x);}println!();}'
  },
  {
    language: "go",
    entry: "main.go",
    source: 'package main\nimport("fmt";"io";"os")\nfunc main(){b,_:=io.ReadAll(os.Stdin);fmt.Printf("%x\\n",b)}'
  },
  {
    language: "java",
    entry: "Main.java",
    source: 'import java.io.*;public class Main{public static void main(String[]args)throws Exception{BufferedReader r=new BufferedReader(new InputStreamReader(System.in));String s;while((s=r.readLine())!=null)System.out.println("["+s+"]");System.out.println("EOF");}}'
  },
  {
    language: "javascript",
    entry: "main.js",
    source: 'import * as std from "std";const s=std.in.readAsString();console.log(Array.from(unescape(encodeURIComponent(s)),c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(""));if(std.in.readAsString()!=="")throw Error("Repeated stdin");'
  },
  {
    language: "typescript",
    entry: "main.ts",
    source: 'import * as std from "std";const s=std.in.readAsString();console.log(Array.from(unescape(encodeURIComponent(s)),c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(""));if(std.in.readAsString()!=="")throw Error("Repeated stdin");'
  }
];
var inputs = [
  {
    id: "empty",
    stdin: ""
  },
  {
    id: "lf",
    stdin: "\n"
  },
  {
    id: "one-byte",
    stdin: "x"
  },
  {
    id: "no-final-lf",
    stdin: "abc"
  },
  {
    id: "final-lf",
    stdin: "abc\n"
  },
  {
    id: "multiple-lf",
    stdin: "abc\n\n"
  },
  {
    id: "crlf",
    stdin: "abc\r\nx\r\n"
  },
  {
    id: "bare-cr",
    stdin: "abc\rx"
  },
  {
    id: "spaces",
    stdin: "  abc 	\n x  "
  },
  {
    id: "unicode",
    stdin: "\u4E2D\u6587\u{1F642}\n\u7D42"
  },
  {
    id: "bom",
    stdin: "\uFEFFabc\n"
  },
  {
    id: "nul",
    stdin: "a\0b\n"
  },
  {
    id: "long-line",
    stdin: "x".repeat(8193)
  },
  {
    id: "last-line",
    stdin: "first\nlast"
  }
];
var STDIO_CONFORMANCE_CASES = programs.flatMap((program) => inputs.map(({ id, stdin }) => {
  const lines = stdin === "" ? [] : stdin.split(/\r\n|\r|\n/);
  if (/[\r\n]$/.test(stdin)) lines.pop();
  return {
    id: `${program.language}-wasip1-stdio-${id}`,
    label: `${program.language} / wasip1 / stdin ${id}`,
    input: {
      language: program.language,
      target: "wasip1",
      entry: program.entry,
      files: { [program.entry]: program.source }
    },
    run: { stdin },
    expect: {
      code: 0,
      stdout: program.language === "java" ? `${lines.map((line) => `[${line}]
`).join("")}EOF
` : `${Array.from(new TextEncoder().encode(stdin), (byte) => byte.toString(16).padStart(2, "0")).join("")}
`,
      stderr: "",
      termination: "exited"
    }
  };
}));
var DEFAULT_CONFORMANCE_CASES = deepFreeze([
  {
    id: "c-wasip1",
    label: "C / wasip1",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": '#include <stdio.h>\nint main(void){ long long a,b; if(scanf("%lld%lld",&a,&b)!=2)return 2; printf("%lld\\n",a+b); }\n' }
    },
    run: { stdin: "7 35\n" },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "c-wasip1-filesystem-metadata",
    label: "C / wasip1 / filesystem metadata",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": [
        "#include <stdint.h>",
        "#include <stdio.h>",
        "#include <string.h>",
        '__attribute__((import_module("wasi_snapshot_preview1"), import_name("path_filestat_get")))',
        "extern int wasi_path_filestat_get(int, int, const char *, unsigned, void *);",
        "int main(void){",
        '  FILE *file=fopen("/wasm-oj-meta","wb"); if(!file)return 2;',
        '  if(fputs("x",file)<0 || fclose(file))return 3;',
        "  unsigned char stat[64]={0};",
        '  if(wasi_path_filestat_get(3,0,"wasm-oj-meta",12,stat))return 4;',
        "  uint64_t atime,mtime,ctime;",
        "  memcpy(&atime,stat+40,8); memcpy(&mtime,stat+48,8); memcpy(&ctime,stat+56,8);",
        '  printf("%llu %llu %llu\\n",(unsigned long long)atime,(unsigned long long)mtime,(unsigned long long)ctime);',
        "  return 0;",
        "}",
        ""
      ].join("\n") }
    },
    expect: {
      code: 0,
      stdout: "946684800000000000 946684800000000000 946684800000000000\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "c-wasip1-file-io",
    label: "C / wasip1 / multi-file IO",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": [
        "#include <stdio.h>",
        "int main(void){",
        '  FILE *left=fopen("/input/left.txt","r");',
        '  FILE *right=fopen("/input/right.txt","r");',
        "  if(!left||!right)return 2;",
        '  long long a,b; if(fscanf(left,"%lld",&a)!=1||fscanf(right,"%lld",&b)!=1)return 3;',
        "  fclose(left); fclose(right);",
        '  FILE *output=fopen("/output/answer.txt","w"); if(!output)return 4;',
        '  if(fprintf(output,"%lld\\n",a+b)<0||fclose(output))return 5;',
        "  return 0;",
        "}",
        ""
      ].join("\n") }
    },
    run: {
      files: {
        "/input/left.txt": "19\n",
        "/input/right.txt": "23\n"
      },
      outputPaths: ["/output/answer.txt"]
    },
    expect: {
      code: 0,
      stdout: "",
      stderr: "",
      files: { "/output/answer.txt": "42\n" },
      termination: "exited"
    }
  },
  {
    id: "c-wasip1-filesystem-limit",
    label: "C / wasip1 / filesystem write limit",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": [
        "#include <stdio.h>",
        "int main(void){",
        "  const unsigned char bytes[8]={1,2,3,4,5,6,7,8};",
        '  FILE *file=fopen("/output/exhausted.bin","wb"); if(!file)return 2;',
        "  (void)fwrite(bytes,1,sizeof(bytes),file);",
        "  (void)fclose(file);",
        "  return 0;",
        "}",
        ""
      ].join("\n") }
    },
    run: {
      outputPaths: ["/output/exhausted.bin"],
      resources: {
        filesystemWriteLimitBytes: 4,
        filesystemEntryLimit: 1
      }
    },
    expect: {
      code: 137,
      stdout: "",
      stderr: "",
      files: { "/output/exhausted.bin": "" },
      termination: "filesystem-limit"
    }
  },
  {
    id: "c-wasix",
    label: "C / WASIX",
    input: {
      language: "c",
      target: "wasix",
      entry: "src/main.c",
      files: { "src/main.c": '#include <stdio.h>\nint main(void){ puts("c-wasix"); }\n' }
    },
    expect: {
      code: 0,
      stdout: "c-wasix\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "c-wasix-denied-thread-spawn",
    label: "C / WASIX / denied thread_spawn",
    input: {
      language: "c",
      target: "wasix",
      entry: "src/main.c",
      files: { "src/main.c": [
        '__attribute__((import_module("wasix_32v1"), import_name("thread_spawn")))',
        "extern int thread_spawn(int start_ptr, int user_data);",
        "int main(void){ return thread_spawn(0, 0); }",
        ""
      ].join("\n") }
    },
    expect: {
      code: 1,
      stdout: "",
      stderr: "",
      termination: "trap",
      trapMessageIncludes: "WASM-OJ denied nondeterministic capability wasix_32v1.thread_spawn"
    }
  },
  {
    id: "cpp-wasip1",
    label: "C++ / wasip1",
    input: {
      language: "cpp",
      target: "wasip1",
      entry: "src/main.cpp",
      files: { "src/main.cpp": 'extern "C" int puts(const char*);\ntemplate<unsigned N> constexpr int sum(const int (&v)[N]){ int s=0; for(unsigned i=0;i<N;++i)s+=v[i]; return s; }\nconstexpr int values[]{10,20,12};\nstatic_assert(sum(values)==42);\nint main(){ return puts("42") < 0; }\n' }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "cpp-wasix",
    label: "C++ / WASIX",
    input: {
      language: "cpp",
      target: "wasix",
      entry: "src/main.cpp",
      files: { "src/main.cpp": 'extern "C" int puts(const char*);\ntemplate<unsigned N> constexpr int sum(const int (&v)[N]){ int s=0; for(unsigned i=0;i<N;++i)s+=v[i]; return s; }\nconstexpr int values[]{10,20,12};\nstatic_assert(sum(values)==42);\nint main(){ return puts("42") < 0; }\n' }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "rust-wasip1",
    label: "Rust / wasip1",
    input: {
      language: "rust",
      target: "wasip1",
      entry: "src/main.rs",
      files: { "src/main.rs": 'fn main(){ let values=vec![10,20,12]; println!("{}", values.iter().sum::<i32>()); }\n' }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "python-wasip1",
    label: "Python / wasip1",
    input: {
      language: "python",
      target: "wasip1",
      entry: "src/main.py",
      files: { "src/main.py": "values = [10, 20, 12]\nprint(sum(values))\n" }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "python-wasip1-stdin-eof",
    label: "Python / wasip1 / redirected input at EOF",
    input: {
      language: "python",
      target: "wasip1",
      entry: "src/main.py",
      files: { "src/main.py": [
        "import os, sys",
        "assert not any(os.isatty(fd) for fd in range(3))",
        "assert not any(stream.isatty() for stream in (sys.stdin, sys.stdout, sys.stderr))",
        "assert input() == 'abc\\r'",
        "assert input() == 'x'",
        "assert input() == '\u7D42'",
        "try:",
        "    input()",
        "except EOFError:",
        "    print('OK')",
        "else:",
        "    raise AssertionError('Expected EOFError')",
        ""
      ].join("\n") }
    },
    run: { stdin: "abc\r\nx\n\u7D42" },
    expect: {
      code: 0,
      stdout: "OK\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "python-wasip1-stdin-bytes",
    label: "Python / wasip1 / exact input bytes",
    input: {
      language: "python",
      target: "wasip1",
      entry: "src/main.py",
      files: { "src/main.py": "import sys\nassert sys.stdin.buffer.read() == b'abc\\r\\nx'\nprint('OK')\n" }
    },
    run: { stdin: "abc\r\nx" },
    expect: {
      code: 0,
      stdout: "OK\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "javascript-wasip1",
    label: "JavaScript / wasip1",
    input: {
      language: "javascript",
      target: "wasip1",
      entry: "src/main.js",
      files: { "src/main.js": "import * as std from 'std';\nstd.out.puts(String([10,20,12].reduce((a,b)=>a+b,0))+'\\n');\n" }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "typescript-wasip1",
    label: "TypeScript / wasip1",
    input: {
      language: "typescript",
      target: "wasip1",
      entry: "src/main.ts",
      files: { "src/main.ts": "import * as std from 'std';\nconst values: number[]=[10,20,12];\nstd.out.puts(String(values.reduce((a,b)=>a+b,0))+'\\n');\n" }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "go-wasip1",
    label: "Go / wasip1",
    input: {
      language: "go",
      target: "wasip1",
      entry: "src/main.go",
      files: { "src/main.go": 'package main\nimport "fmt"\nfunc main(){ values:=[]int{10,20,12}; total:=0; for _,v:=range values { total+=v }; fmt.Println(total) }\n' }
    },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "java-wasip1",
    label: "Java / wasip1",
    input: {
      language: "java",
      target: "wasip1",
      entry: "Main.java",
      files: { "Main.java": [
        "import java.io.BufferedReader;",
        "import java.io.InputStreamReader;",
        "import java.util.StringTokenizer;",
        "public final class Main {",
        "  public static void main(String[] args) throws Exception {",
        "    StringTokenizer tokens = new StringTokenizer(new BufferedReader(new InputStreamReader(System.in)).readLine());",
        "    System.out.println(Integer.parseInt(tokens.nextToken()) + Integer.parseInt(tokens.nextToken()));",
        "  }",
        "}",
        ""
      ].join("\n") }
    },
    run: { stdin: "7 35\n" },
    expect: {
      code: 0,
      stdout: "42\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "java-wasip1-exceptions",
    label: "Java / wasip1 / exceptions",
    input: {
      language: "java",
      target: "wasip1",
      entry: "Main.java",
      files: { "Main.java": [
        "public final class Main {",
        "  public static void main(String[] args) {",
        "    try {",
        '      throw new IllegalArgumentException("expected");',
        "    } catch (IllegalArgumentException error) {",
        '      System.out.println("caught");',
        "    }",
        "  }",
        "}",
        ""
      ].join("\n") }
    },
    expect: {
      code: 0,
      stdout: "caught\n",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "java-wasip1-empty-release",
    label: "Java / wasip1 / empty release",
    input: {
      language: "java",
      target: "wasip1",
      optimization: "release",
      entry: "Main.java",
      files: { "Main.java": "public final class Main { public static void main(String[] args) {} }\n" }
    },
    expect: {
      code: 0,
      stdout: "",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "java-wasip1-empty-debug",
    label: "Java / wasip1 / empty debug",
    input: {
      language: "java",
      target: "wasip1",
      optimization: "debug",
      entry: "Main.java",
      files: { "Main.java": "public final class Main { public static void main(String[] args) {} }\n" }
    },
    expect: {
      code: 0,
      stdout: "",
      stderr: "",
      termination: "exited"
    }
  },
  {
    id: "c-wasip1-virtual-clock",
    label: "C / wasip1 / virtual clock",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": [
        "#include <stdint.h>",
        "#include <stdio.h>",
        "#include <string.h>",
        '__attribute__((import_module("wasi_snapshot_preview1"), import_name("clock_time_get")))',
        "extern unsigned wasi_clock_time_get(unsigned, uint64_t, uint64_t *);",
        '__attribute__((import_module("wasi_snapshot_preview1"), import_name("poll_oneoff")))',
        "extern unsigned wasi_poll_oneoff(const void *, void *, unsigned, unsigned *);",
        "static void put32(unsigned char *p,uint32_t v){ memcpy(p,&v,4); }",
        "static void put64(unsigned char *p,uint64_t v){ memcpy(p,&v,8); }",
        "int main(void){",
        "  unsigned char subscriptions[96]={0},events[64]={0}; unsigned count=0; uint64_t before,after,realtime;",
        "  if(wasi_clock_time_get(1,0,&before))return 2;",
        "  put64(subscriptions,7); subscriptions[8]=0; put32(subscriptions+16,1);",
        "  put64(subscriptions+24,5000000000ULL); put64(subscriptions+32,1);",
        "  if(wasi_poll_oneoff(subscriptions,events,1,&count)||count!=1)return 3;",
        "  if(wasi_clock_time_get(1,0,&after))return 4;",
        "  memset(subscriptions,0,sizeof(subscriptions)); memset(events,0,sizeof(events));",
        "  put64(subscriptions,8); subscriptions[8]=0; put32(subscriptions+16,0);",
        "  put64(subscriptions+24,946684810000000000ULL); put64(subscriptions+32,1); put32(subscriptions+40,1);",
        "  if(wasi_poll_oneoff(subscriptions,events,1,&count)||count!=1)return 5;",
        "  if(wasi_clock_time_get(0,0,&realtime))return 6;",
        "  memset(subscriptions,0,sizeof(subscriptions)); memset(events,0,sizeof(events));",
        "  put64(subscriptions,9); subscriptions[8]=2; put32(subscriptions+16,1);",
        "  put64(subscriptions+48,10); subscriptions[56]=0; put32(subscriptions+64,1);",
        "  put64(subscriptions+72,5000000000ULL); put64(subscriptions+80,1);",
        "  if(wasi_poll_oneoff(subscriptions,events,2,&count)||count<1)return 7;",
        '  printf("%llu %llu %llu\\n",(unsigned long long)before,(unsigned long long)after,(unsigned long long)realtime);',
        "  return 0;",
        "}",
        ""
      ].join("\n") }
    },
    expect: {
      code: 0,
      stdout: "0 5001000000 946684810000000000\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 10001e6
    }
  },
  {
    id: "c-wasip1-logical-time-limit",
    label: "C / wasip1 / logical time limit",
    input: {
      language: "c",
      target: "wasip1",
      entry: "src/main.c",
      files: { "src/main.c": [
        "#include <stdint.h>",
        "#include <string.h>",
        '__attribute__((import_module("wasi_snapshot_preview1"), import_name("poll_oneoff")))',
        "extern unsigned wasi_poll_oneoff(const void *, void *, unsigned, unsigned *);",
        "int main(void){",
        "  unsigned char subscription[48]={0},event[32]={0}; unsigned count=0;",
        "  uint64_t userdata=1,timeout=11000000,precision=1; uint32_t clock=1;",
        "  memcpy(subscription,&userdata,8); subscription[8]=0; memcpy(subscription+16,&clock,4);",
        "  memcpy(subscription+24,&timeout,8); memcpy(subscription+32,&precision,8);",
        "  return (int)wasi_poll_oneoff(subscription,event,1,&count);",
        "}",
        ""
      ].join("\n") }
    },
    run: { resources: { logicalTimeLimitMs: 10 } },
    expect: {
      code: 137,
      stdout: "",
      stderr: "",
      termination: "logical-time-limit",
      logicalTimeNs: 1e7
    }
  },
  {
    id: "cpp-wasip1-virtual-sleep",
    label: "C++ / wasip1 / virtual sleep",
    input: {
      language: "cpp",
      target: "wasip1",
      entry: "src/main.cpp",
      files: { "src/main.cpp": [
        "#include <cstdio>",
        "#include <ctime>",
        "static unsigned long long ns(const timespec& value){ return (unsigned long long)value.tv_sec*1000000000ULL+(unsigned long long)value.tv_nsec; }",
        'int main(){ timespec before{},after{},delay{5,0}; if(clock_gettime(CLOCK_MONOTONIC,&before))return 2; if(nanosleep(&delay,nullptr))return 3; if(clock_gettime(CLOCK_MONOTONIC,&after))return 4; std::printf("%llu\\n",ns(after)-ns(before)); }',
        ""
      ].join("\n") }
    },
    expect: {
      code: 0,
      stdout: "5001000000\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5002e6
    }
  },
  {
    id: "rust-wasip1-virtual-sleep",
    label: "Rust / wasip1 / virtual sleep",
    input: {
      language: "rust",
      target: "wasip1",
      entry: "src/main.rs",
      files: { "src/main.rs": 'use std::time::{Duration,Instant};\nfn main(){ let before=Instant::now(); std::thread::sleep(Duration::from_secs(5)); println!("{}",before.elapsed().as_nanos()); }\n' }
    },
    expect: {
      code: 0,
      stdout: "5001000000\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5002e6
    }
  },
  {
    id: "python-wasip1-virtual-sleep",
    label: "Python / wasip1 / virtual sleep",
    input: {
      language: "python",
      target: "wasip1",
      entry: "src/main.py",
      files: { "src/main.py": "import time\nbefore = time.monotonic_ns()\ntime.sleep(5)\nprint(time.monotonic_ns() - before)\n" }
    },
    expect: {
      code: 0,
      stdout: "5001000000\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5008e6
    }
  },
  {
    id: "javascript-wasip1-virtual-clock",
    label: "JavaScript / wasip1 / virtual clock",
    input: {
      language: "javascript",
      target: "wasip1",
      entry: "src/main.js",
      files: { "src/main.js": "import * as std from 'std';\nconst before=Date.now(); while(Date.now()<before+5000){} std.out.puts(String(Date.now()-before)+'\\n');\n" }
    },
    expect: {
      code: 0,
      stdout: "5001\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5004e6
    }
  },
  {
    id: "typescript-wasip1-virtual-clock",
    label: "TypeScript / wasip1 / virtual clock",
    input: {
      language: "typescript",
      target: "wasip1",
      entry: "src/main.ts",
      files: { "src/main.ts": "import * as std from 'std';\nconst before: number=Date.now(); while(Date.now()<before+5000){} std.out.puts(String(Date.now()-before)+'\\n');\n" }
    },
    expect: {
      code: 0,
      stdout: "5001\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5004e6
    }
  },
  {
    id: "go-wasip1-virtual-sleep",
    label: "Go / wasip1 / virtual sleep",
    input: {
      language: "go",
      target: "wasip1",
      entry: "src/main.go",
      files: { "src/main.go": 'package main\nimport ("fmt"; "time")\nfunc main(){ before:=time.Now(); time.Sleep(5*time.Second); fmt.Println(time.Since(before).Nanoseconds()) }\n' }
    },
    expect: {
      code: 0,
      stdout: "5004000000\n",
      stderr: "",
      termination: "exited",
      logicalTimeNs: 5016e6
    }
  }
]);
var CPP_STDLIB_CONFORMANCE_CASE = deepFreeze({
  id: "cpp-stdlib-wasip1",
  label: "C++ stdlib / wasip1",
  input: {
    language: "cpp",
    target: "wasip1",
    entry: "src/main.cpp",
    files: {
      "src/wasm-oj.pch.hpp": WASM_OJ_LIBCXX_PCH_HEADER,
      "src/main.cpp": 'int main(){ constexpr std::array<int,3> v{10,20,12}; int s=0; for(int x:v)s+=x; std::printf("%d\\n",s); }\n'
    }
  },
  expect: {
    code: 0,
    stdout: "42\n",
    stderr: "",
    termination: "exited"
  }
});
var FULL_CONFORMANCE_CASES = deepFreeze([
  ...DEFAULT_CONFORMANCE_CASES,
  ...STDIO_CONFORMANCE_CASES,
  CPP_STDLIB_CONFORMANCE_CASE
]);
function deepFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

// node_modules/es-module-lexer/dist/lexer.js
var ImportType = (function(A3) {
  return A3[A3.Static = 1] = "Static", A3[A3.Dynamic = 2] = "Dynamic", A3[A3.ImportMeta = 3] = "ImportMeta", A3[A3.StaticSourcePhase = 4] = "StaticSourcePhase", A3[A3.DynamicSourcePhase = 5] = "DynamicSourcePhase", A3[A3.StaticDeferPhase = 6] = "StaticDeferPhase", A3[A3.DynamicDeferPhase = 7] = "DynamicDeferPhase", A3;
})({});
var A = 1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
var E;
var C = () => {
  return A3 = "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", "undefined" != typeof Buffer ? Buffer.from(A3, "base64") : Uint8Array.from(atob(A3), (A4) => A4.charCodeAt(0));
  var A3;
};
var init = WebAssembly.compile(C()).then(WebAssembly.instantiate).then(({ exports: A3 }) => {
  E = A3;
});

// node_modules/@wasm-oj/browser/dist/index.js
var y = `22.0.0-git20542-10`;
var ne = `wasm-oj/clang@${y}`;
var re = `/toolchains/clang-${y}.webc.gz.bin`;
var ie = `/toolchains/clang-${y}.cc1-pins.json`;
var ae = `/toolchains/clang-${y}.manifest.json`;
var oe = `/toolchains/clang-${y}.libcxx-pch.json`;
var se = `/toolchains/clang-${y}.cpp-debug.pch.gz.bin`;
var ce = `/toolchains/clang-${y}.cpp-release.pch.gz.bin`;
var b = `7f10d90b8e52b270f04874641a1d0bf9e94e85b4f6c7573a774cebbc6d32552a`;
var le = `21ded33b9c6d4e1aaad5528c940bdaf6c3e84be77ea8f522f018ca7289a2a224`;
var x = `895eee17c63b1112c84adcc4ddbcb38e0c18e53bff15f50a8689b9b82d87b1ff`;
var S = `6382dcdfb6a2da49032a0e08da3b1fb490eb24432be85c3c12e3e871a5065273`;
var ue = `9bbe41d77c786f1c36169369c909268530b05726e1581683f6edd9a2983eebd0`;
var de = Object.freeze({ "cpp-debug": Object.freeze({ path: se, sha256: `c420c4643c48826643e75585d5bfdc281f11883d4bda28b283e3c706f3046b3a`, compressedSha256: `a3811351bae3289caf096f2d4bb6d2ee5db84b97e05514e87190d36b65c500cf` }), "cpp-release": Object.freeze({ path: ce, sha256: `c4b2132cc6d698e97dd1386431fdb54faaaf38b35b2528c7bc854f860d1f64b1`, compressedSha256: `ef004fc05ec50af697a37f7c9c814bf62e9676d0de162d6ac35305533939f93f` }) });
var C2 = `3.14.7`;
var fe = `a42c98f5f00582638c8e445440c506bbf94d5e55b3415d1f8d82d11c56cd4b56`;
var pe = `${`wasm-oj/cpython@${C2}`}#sha256:${fe}`;
var me = `/toolchains/python-${C2}-wasip1.webc.gz.bin`;
var he = `/toolchains/python-${C2}-wasip1.manifest.json`;
var ge = `10027f0e32c77dfa0ce1c413b6cb27307d6744fe5e18e6da8cea738bd020260c`;
var _e = `53a24b258363a8494af164121111a34b49c85fa0e054627fe131feba6f359cd5`;
var ve = `c1acac884af1c86833db5b65f8cc0a2304fce74dea0a05d9b40bde0a4e3e7c0e`;
var ye = `0.15.1`;
var be = `wasm-oj/quickjs-ng@${ye}`;
var xe = `/toolchains/quickjs-${ye}.wasm.gz.bin`;
var Se = `dc6e02e8610269e61b341331661515616451cec929fd534fa96d1c4f47fbcc9a`;
var w = `7.0.2`;
var Ce = `/toolchains/typescript-${w}.wasm.gz.bin`;
var we = `29c6ee0e46151e2644049ae96162b1b1d46dcb13310e2a928114bb9030c3ea92`;
var T = `1.91.1-dev`;
var Te = `/toolchains/rust-${T}.webc.gz.bin`;
var Ee = `/toolchains/rust-${T}.manifest.json`;
var De = `cfbdadc67be1315e735aa55bdf8a5a0d00171982a023fefcf7ba586127753887`;
var E2 = `765de8d68d03078e79f69f49dec0dcab1ff96fe3bbe5e9eafebb2ce61a39d3ee`;
var D = `d5bbdca994e61888679c5738cb9420649c0854ed0eb5d65468bc67d5d550bce1`;
var O = `1.26.5`;
var Oe = `/toolchains/go-${O}-wasip1.webc.gz.bin`;
var ke = `/toolchains/go-${O}-wasip1.manifest.json`;
var Ae = `/toolchains/go-${O}-wasip1.stdlib.gz.bin`;
var k = `70a7e359884b09b2e1a622d6ac5cd6e31c334aab519e6dd80dff5e040a9e09e4`;
var A2 = `c3a97934b6a83fefdea5c31f99141f70f76189eedc9ec0fa9ccd41302e50963b`;
var j = `5d784e9ca640b9525e84b598c0beb97ca110ae908568ca45f6441a441d99a262`;
var M = `aeffc384fdc624544f174ba5fc3c22395717fdbc3c4387d677d20855b6be80d8`;
var je = `e1ec64b08efd02b35b7ffdaf3970875aaae98325fa4795eafca94ebae2d0d192`;
var Me = `9e557f5b86961fd604217d7521461c5d2b7322e383fa30dead5669b77db12201`;
var Ne = `2eefca10af935a307ab7946447146bd30e0ea0fb5460be54dc1c55844d155580`;
var Pe = `wasm-oj/java-teavm@teavm-0.13.1-wasmgc-wasip1`;
var Fe = `/toolchains/java-teavm-0.13.1.compiler.wasm`;
var Ie = `/toolchains/java-teavm-0.13.1.compile-classlib.bin`;
var Le = `/toolchains/java-teavm-0.13.1.runtime-classlib.bin`;
var Re = `8c37bce1c6fceeaffeffe93e10834309b67c8b6fb58c6f8a24547afe8be67f5d`;
var ze = `738a82b7d7e7ff8d98b07bb076785da7035847a166afb8446fd150c4efce6103`;
var Be = `0ed234b66cdde19cb29e6c2865a3636d792d3cf72f102e73a7b3fdede80b79e6`;
Object.freeze({ [re]: b, [ie]: x, [ae]: S, [oe]: ue, [se]: de[`cpp-debug`].compressedSha256, [ce]: de[`cpp-release`].compressedSha256, [me]: ge, [he]: _e, [xe]: Se, [Ce]: we, [Te]: De, [Ee]: D, [Oe]: k, [ke]: j, [Ae]: M, [Fe]: Re, [Ie]: ze, [Le]: Be });
var Ve = Object.freeze({ c: Object.freeze([b, le, x, S]), cpp: Object.freeze([b, le, x, S]), rust: Object.freeze([De, E2, D]), python: Object.freeze([ge, fe, _e, ve]), javascript: Object.freeze([we, Se]), typescript: Object.freeze([we, Se]), go: Object.freeze([k, A2, j, M, je, Me, Ne]) });
function He(e) {
  if (e === `java`) return [Re, ze, Be].join(`.`);
  if (!isBuiltinLanguage(e)) throw Error(`WASM-OJ has no built-in toolchain for '${e}'.`);
  return Ve[e].join(`.`);
}
function N(e) {
  return Object.freeze({ ...e, compilerPackages: Object.freeze([...e.compilerPackages]), targets: Object.freeze([...e.targets]) });
}
var Ue = Object.freeze({ c: N({ language: `c`, label: `Clang 22`, artifact: `wasm`, compilerPackages: [ne], targets: [`wasip1`, `wasix`], version: y, note: `Native wasip1 module via Clang and LLD; directly executable by WASI and WASIX runtimes.` }), cpp: N({ language: `cpp`, label: `Clang++ 22 (C++20)`, artifact: `wasm`, compilerPackages: [ne], targets: [`wasip1`, `wasix`], version: y, note: `C++20/libc++ wasip1 module; directly executable by WASI and WASIX runtimes.` }), rust: N({ language: `rust`, label: `Rust ${T}`, artifact: `wasm`, compilerPackages: [`rustc@${T}#sha256:${E2}`], targets: [`wasip1`], version: T, note: `Real rustc, its matching standard library, and a fresh deterministic wasm-ld stage execute as one pinned WebC under Wasmer.` }), python: N({ language: `python`, label: `CPython ${C2}`, artifact: `runtime-bundle`, compilerPackages: [pe], runtimePackage: pe, targets: [`wasip1`], version: C2, note: `Python source files executed by the source-built CPython wasm32-wasip1 interpreter and standard library.` }), javascript: N({ language: `javascript`, label: `QuickJS-ng`, artifact: `runtime-bundle`, compilerPackages: [`typescript@${w}-wasi`], runtimePackage: be, targets: [`wasip1`], version: ye, note: `JavaScript checked by TypeScript/WASI, then executed by the bundled QuickJS-ng/WASI runtime.` }), typescript: N({ language: `typescript`, label: `TypeScript + QuickJS-ng`, artifact: `runtime-bundle`, compilerPackages: [`typescript@${w}-wasi`], runtimePackage: be, targets: [`wasip1`], version: w, note: `The native TypeScript compiler and QuickJS-ng runtime both execute as local WASI modules.` }), go: N({ language: `go`, label: `Go ${O}`, artifact: `wasm`, compilerPackages: [`go@${O}#sha256:${A2}`], targets: [`wasip1`], version: O, note: `The standard Go compiler, linker, and pinned wasip1 standard library execute locally as one WebC under Wasmer.` }) });
function We(e) {
  if (e === `java`) return [Pe];
  if (!isBuiltinLanguage(e)) throw Error(`WASM-OJ has no built-in toolchain for '${e}'.`);
  let t = Ue[e];
  return [.../* @__PURE__ */ new Set([...t.compilerPackages, ...t.runtimePackage ? [t.runtimePackage] : []])];
}
var P = Object.freeze({ files: 256, bytesPerFile: 4194304, totalBytes: 16777216 });
var Ge = new TextEncoder();
function Ke(e, t) {
  return e < t ? -1 : +(e > t);
}
function F(e, t = `Project path`) {
  if (typeof e != `string` || !e || e !== e.trim() || e.length > 4096) throw Error(`${t} must be a non-empty, trimmed string of at most 4096 characters.`);
  if (e.startsWith(`/`) || e.includes(`\\`) || e.includes(`\0`) || e.split(`/`).some((e2) => !e2 || e2 === `.` || e2 === `..`)) throw Error(`${t} '${e}' must be a normalized relative path that cannot escape the project.`);
}
function qe(e) {
  if (!Array.isArray(e) || e.length === 0) throw Error(`A project must contain at least one source file.`);
  if (e.length > P.files) throw Error(`A project cannot contain more than ${P.files} source files.`);
  let t = /* @__PURE__ */ new Set(), n = 0;
  return e.map((e2, r) => {
    if (!e2 || typeof e2 != `object`) throw Error(`Project file ${r} is invalid.`);
    if (F(e2.path, `Project file ${r} path`), assertLanguageIdentifier(e2.language), typeof e2.content != `string`) throw Error(`Project file '${e2.path}' content must be a string.`);
    if (e2.content.length > P.bytesPerFile) throw Error(`Project file '${e2.path}' exceeds the ${P.bytesPerFile} byte source limit.`);
    let i = Ge.encode(e2.content).byteLength;
    if (i > P.bytesPerFile) throw Error(`Project file '${e2.path}' exceeds the ${P.bytesPerFile} byte source limit.`);
    if (n += i, n > P.totalBytes) throw Error(`Project sources exceed the ${P.totalBytes} byte total limit.`);
    if (t.has(e2.path)) throw Error(`Duplicate project path '${e2.path}'.`);
    return t.add(e2.path), { path: e2.path, language: e2.language, content: e2.content };
  }).sort((e2, t2) => Ke(e2.path, t2.path));
}
function I(e) {
  if (!e || typeof e != `object` || Array.isArray(e)) throw Error(`Runtime bundle files must be a record.`);
  return Object.entries(e).map(([e2, t]) => (F(e2, `Runtime bundle path`), [e2, t])).sort(([e2], [t]) => Ke(e2, t));
}
async function L(e) {
  let t = typeof e == `string` ? new TextEncoder().encode(e) : e, n = new Uint8Array(t.byteLength);
  n.set(t);
  let r = await crypto.subtle.digest(`SHA-256`, n);
  return Array.from(new Uint8Array(r), (e2) => e2.toString(16).padStart(2, `0`)).join(``);
}
var R = 1048576;
var z = Object.freeze({ requirements: 128, sourceFiles: 128, sourceTextBytes: 8 * R, hosts: 32, roots: 512, packages: 512, referencesPerPackage: 512, concurrency: 16, metadataBytes: 8 * R, packageBytes: 256 * R, totalDownloadBytes: 512 * R, archiveFiles: 16384, unpackedBytes: 512 * R });
Object.freeze({ packages: z.packages, filesPerPackage: z.archiveFiles, bytesPerFile: 64 * R, totalBytes: z.unpackedBytes });
var B = `payloads`;
var Je = /^[0-9a-f]{64}$/;
var V = class {
  database;
  async load(e) {
    Ze(e);
    let t = (await this.open()).transaction(B, `readonly`), n = await Ye(t.objectStore(B).get(e));
    if (await H(t), n !== void 0) {
      if (!Xe(n) || n.digest !== e || !(n.payload instanceof Uint8Array) || await L(n.payload) !== e) throw await this.delete(e), Error(`Cached dependency '${e}' failed integrity verification.`);
      return await this.touch(e), n.payload.slice();
    }
  }
  async save(e, t) {
    if (Ze(e), !(t instanceof Uint8Array) || await L(t) !== e) throw Error(`Dependency cache payload digest mismatch.`);
    let n = (await this.open()).transaction(B, `readwrite`);
    n.objectStore(B).put({ byteLength: t.byteLength, digest: e, lastAccessedAt: Date.now(), payload: t.slice() }), await H(n);
  }
  async delete(e) {
    Ze(e);
    let t = (await this.open()).transaction(B, `readwrite`);
    t.objectStore(B).delete(e), await H(t);
  }
  async clear() {
    let e = (await this.open()).transaction(B, `readwrite`);
    e.objectStore(B).clear(), await H(e);
  }
  async listStorageEntries() {
    let e = (await this.open()).transaction(B, `readonly`), t = await Ye(e.objectStore(B).getAll());
    return await H(e), t.map((e2) => {
      if (!Xe(e2)) throw Error(`Dependency cache contains an invalid storage record.`);
      return { key: e2.digest, byteLength: e2.byteLength, lastAccessedAt: e2.lastAccessedAt };
    });
  }
  storageParticipant() {
    return { id: `dependencies`, retentionPriority: 40, list: () => this.listStorageEntries(), delete: (e) => this.delete(e), clear: () => this.clear() };
  }
  close() {
    let e = this.database;
    this.database = void 0, e?.then((e2) => e2.close()).catch(() => void 0);
  }
  open() {
    return this.database ??= new Promise((e, t) => {
      let n = indexedDB.open(WASM_OJ_STORAGE.dependencyCache, 1);
      n.addEventListener(`upgradeneeded`, () => {
        n.result.objectStoreNames.contains(B) || n.result.createObjectStore(B, { keyPath: `digest` });
      }), n.addEventListener(`success`, () => e(n.result), { once: true }), n.addEventListener(`error`, () => t(n.error ?? Error(`Unable to open dependency cache.`)), { once: true }), n.addEventListener(`blocked`, () => t(Error(`Dependency cache upgrade is blocked by another tab.`)), { once: true });
    }), this.database.catch(() => {
      this.database = void 0;
    }), this.database;
  }
  async touch(e) {
    let t = (await this.open()).transaction(B, `readwrite`), n = t.objectStore(B), r = await Ye(n.get(e));
    if (r !== void 0) {
      if (!Xe(r)) throw Error(`Dependency cache contains an invalid storage record.`);
      n.put({ ...r, lastAccessedAt: Date.now() });
    }
    await H(t);
  }
};
function Ye(e) {
  return new Promise((t, n) => {
    e.addEventListener(`success`, () => t(e.result), { once: true }), e.addEventListener(`error`, () => n(e.error ?? Error(`IndexedDB request failed.`)), { once: true });
  });
}
function H(e) {
  return new Promise((t, n) => {
    e.addEventListener(`complete`, () => t(), { once: true }), e.addEventListener(`abort`, () => n(e.error ?? Error(`IndexedDB transaction aborted.`)), { once: true }), e.addEventListener(`error`, () => n(e.error ?? Error(`IndexedDB transaction failed.`)), { once: true });
  });
}
function Xe(e) {
  return typeof e == `object` && !!e && !Array.isArray(e) && Object.keys(e).sort().join(`,`) === `byteLength,digest,lastAccessedAt,payload` && typeof e.digest == `string` && e.payload instanceof Uint8Array && Number.isSafeInteger(e.byteLength) && e.byteLength === e.payload.byteLength && Number.isSafeInteger(e.lastAccessedAt) && e.lastAccessedAt >= 0;
}
function Ze(e) {
  if (!Je.test(e)) throw Error(`Dependency integrity must be lowercase SHA-256 hexadecimal.`);
}
var Qe = `#pragma once
#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <cctype>
#include <cerrno>
#include <cfloat>
#include <charconv>
#include <chrono>
#include <climits>
#include <cmath>
#include <compare>
#include <concepts>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <exception>
#include <functional>
#include <iomanip>
#include <ios>
#include <iostream>
#include <iterator>
#include <limits>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <random>
#include <ranges>
#include <set>
#include <span>
#include <sstream>
#include <stack>
#include <string>
#include <string_view>
#include <tuple>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
`;
new TextDecoder();
function $e(e) {
  return e === Qe;
}
function et2(e) {
  return (e.config.target === `wasip1` || e.config.target === `wasix`) && (e.config.language === `c` || e.config.language === `cpp`);
}
function tt(e) {
  if (!et2(e)) return 0;
  let t = e.config.language === `cpp` ? /\.(?:cc|cpp|cxx)$/ : /\.c$/, n = new Set(e.files.filter((e2) => t.test(e2.path)).map((e2) => e2.path));
  n.add(e.config.entry);
  let r = e.config.language === `cpp` ? e.files.find((e2) => e2.path.split(`/`).at(-1) === `wasm-oj.pch.hpp`) : void 0, i = r && !$e(r.content) ? 1 : 0;
  return n.size + i + 2;
}
function nt(e) {
  let t = tt(e);
  if (t > 8) throw Error(`The browser Clang project requires ${t} compiler stages; the verified per-Worker limit is 8.`);
  return t;
}
function rt(e, t) {
  return !e.success || !e.artifact || !e.buildGraph ? t : (e.buildGraph.misses.pch ?? 0) + (e.buildGraph.misses.object ?? 0) + (e.buildGraph.misses[`link-result`] ?? 0);
}
Object.freeze({ c: `cpp`, cpp: `cpp`, rust: `cargo`, python: `pypi`, javascript: `npm`, typescript: `npm`, go: `go` }), `${O.split(`.`).slice(0, 2).join(`.`)}`;
var it = 18e4;
Object.freeze({ version: O, target: `wasip1/wasm`, packageAsset: Oe, packageCompressedSha256: k, packageSha256: A2, manifestAsset: ke, manifestSha256: j, standardLibraryAsset: Ae, standardLibraryCompressedSha256: M, standardLibrarySha256: je, compilerSha256: Me, linkerSha256: Ne });
var at = `wasm32-wasip1-threads`;
var ot = `2024`;
var st = 18e4;
Object.freeze([`wasi_snapshot_preview1.random_get`, `wasi_snapshot_preview1.clock_time_get`]), Object.freeze({ version: T, packageAsset: Te, packageCompressedSha256: De, packageSha256: E2, manifestAsset: Ee, manifestSha256: D, target: at, edition: ot });
var ct = 6e4;
var lt = 12e4;
var ut = it + 1e4;
var dt = st + 1e4;
function ft(e) {
  if (e === `java`) return 19e4;
  if (!isBuiltinLanguage(e)) throw Error(`The built-in WASM-OJ compiler does not support language '${e}'.`);
  return e === `c` || e === `cpp` ? ct : e === `rust` ? dt : e === `go` ? ut : lt;
}
function pt(e) {
  return e.config.language === `rust`;
}
function mt(e) {
  return pt(e) ? 2 : 0;
}
var ht = `` + new URL(`assets/compiler.worker-Cpp5Hq8T.js`, import.meta.url).href;
function gt(e, t = {}) {
  let n = _t(e, { liveness: true }), r;
  try {
    r = new Worker(n.url, { ...t, type: `module` });
  } finally {
    n.revoke();
  }
  return St(r, t.name), r;
}
function _t(e, { liveness: t = false } = {}) {
  let n = wt(), r = Tt(e), i = new Blob([`const pendingMessages = [];
`, `const queueMessage = (event) => { event.stopImmediatePropagation(); pendingMessages.push(event.data); };
`, `globalThis.addEventListener("message", queueMessage);
`, `Object.defineProperty(globalThis, "__wasmOjModuleWorkerBaseUrl", { value: ${JSON.stringify(n.href)} });
`, ...t ? [yt] : [], `try { await import(${JSON.stringify(r)}); } finally { globalThis.removeEventListener("message", queueMessage); }
`, `for (const data of pendingMessages) globalThis.dispatchEvent(new MessageEvent("message", { data }));
`], { type: `text/javascript` }), a = URL.createObjectURL(i), o = true;
  return { url: a, revoke() {
    o && (o = false, URL.revokeObjectURL(a));
  } };
}
var vt = `__wasmOjWorkerLiveness`;
var yt = `try { const lock = "wasm-oj-worker-" + crypto.randomUUID(); navigator.locks.request(lock, () => { postMessage({ ${vt}: lock }); return new Promise(() => {}); }).catch(() => {}); } catch {}
`;
var bt = /* @__PURE__ */ new WeakMap();
function xt(e, t) {
  let n = bt.get(e);
  if (n) {
    if (n.lost) {
      let e2 = n.lost;
      queueMicrotask(() => t(e2));
      return;
    }
    n.listeners.add(t);
  }
}
function St(e, t) {
  let n = { listeners: /* @__PURE__ */ new Set() };
  bt.set(e, n);
  let r = new AbortController(), i = e.terminate.bind(e);
  e.terminate = () => {
    r.abort(), n.listeners.clear(), i();
  }, e.addEventListener(`message`, (e2) => {
    let i2 = Ct(e2.data);
    if (i2 === void 0) return;
    e2.stopImmediatePropagation();
    let a = globalThis.navigator?.locks;
    a && a.request(i2, { signal: r.signal }, () => {
      if (r.signal.aborted) return;
      let e3 = Error(`The ${t ?? `module`} Worker stopped without reporting an error.`);
      n.lost = e3;
      let i3 = [...n.listeners];
      n.listeners.clear();
      for (let t2 of i3) t2(e3);
    }).catch(() => void 0);
  });
}
function Ct(e) {
  if (typeof e != `object` || !e) return;
  let t = e[vt];
  return typeof t == `string` ? t : void 0;
}
function wt() {
  let e = globalThis.location?.href;
  if (e) {
    let t2 = new URL(e);
    if (t2.protocol === `http:` || t2.protocol === `https:`) return t2;
    if (t2.protocol !== `blob:`) throw Error(`A module Worker requires an HTTP(S) browser base URL.`);
  }
  let t = globalThis.__wasmOjModuleWorkerBaseUrl;
  if (typeof t != `string`) throw Error(`A module Worker requires a browser base URL.`);
  let n = new URL(t);
  if (n.origin === `null` || n.protocol !== `http:` && n.protocol !== `https:`) throw Error(`A module Worker requires an HTTP(S) browser base URL.`);
  return n;
}
function Tt(e) {
  let t = wt(), n;
  try {
    n = new URL(e instanceof URL ? e.href : e, t);
  } catch {
    throw Error(`A module Worker URL must be a valid same-origin HTTP(S) URL.`);
  }
  if (n.origin !== t.origin || n.username || n.password || n.search || n.hash) throw Error(`A module Worker URL must be same-origin and contain no credentials, query, or fragment.`);
  return n.href;
}
async function Et(e, t) {
  let n = snapshotBrowserToolchainSources(e), r = t.optimization ?? `release`;
  toolchainProfileSource(n, t.language, t.target ?? `wasip1`, r);
  let i = globalThis.location?.href;
  if (!i) throw Error(`Toolchain prefetch requires a browser location.`);
  let s = browserToolchainAssetPaths({ language: t.language, optimization: r, libcxxPrecompiledHeader: t.libcxxPrecompiledHeader }).map((e2) => ({ path: e2, bytes: toolchainAssetSource(n, e2).asset.bytes, url: browserToolchainAssetUrl(n, e2, i) })), c = s.reduce((e2, t2) => e2 + t2.bytes, 0), l = 0, u = () => t.onProgress?.({ loadedBytes: l, totalBytes: c });
  u(), await Promise.all(s.map(async (e2) => {
    let n2 = await fetch(e2.url, { signal: t.signal });
    if (!n2.ok || !n2.body) throw Error(`Unable to prefetch pinned toolchain asset '${e2.path}' (${n2.status}).`);
    let r2 = n2.body.getReader(), i2 = 0;
    for (; ; ) {
      let { done: e3, value: t2 } = await r2.read();
      if (e3) break;
      i2 += t2.byteLength, l += t2.byteLength, u();
    }
    if (i2 !== e2.bytes) throw Error(`Prefetched toolchain asset '${e2.path}' has ${i2} bytes; expected ${e2.bytes}.`);
  }));
}
new TextEncoder();
function jt() {
  return new Promise((e, t) => {
    let n = indexedDB.deleteDatabase(WASM_OJ_STORAGE.incrementalBuildCache);
    n.addEventListener(`success`, () => e(), { once: true }), n.addEventListener(`error`, () => {
      t(n.error ?? Error(`Unable to delete the incremental build cache.`));
    }, { once: true }), n.addEventListener(`blocked`, () => {
      t(Error(`Incremental build cache deletion is blocked by another open tab.`));
    }, { once: true });
  });
}
var zt = 12e4;
var Bt = 1e4;
var Vt = class {
  worker;
  pending = /* @__PURE__ */ new Map();
  progressListeners = /* @__PURE__ */ new Set();
  traceListeners = /* @__PURE__ */ new Set();
  readyPromise;
  toolchains;
  activeOperation;
  disposed = false;
  generation = 0;
  workerDormant = false;
  workerInitialized = false;
  outputReadyClangStages = 0;
  outputReadyRustStages = 0;
  retainedGoStage = false;
  acquiredToolchains = /* @__PURE__ */ new Set();
  acquisition;
  constructor(e) {
    if (!e || typeof e != `object`) throw TypeError(`BrowserCompiler requires explicit toolchain options.`);
    this.toolchains = snapshotBrowserToolchainSources(e.toolchains), this.worker = this.createWorker(), this.readyPromise = this.initializeWorker();
  }
  cacheIdentity(e) {
    this.assertActive();
    let { descriptor: t } = toolchainProfileSource(this.toolchains, e.config.language, e.config.target, e.config.optimization).source;
    return JSON.stringify({ ...toolchainCacheIdentity(e.config.language), source: { id: t.id, version: t.version, assets: t.assets.map(({ path: e2, bytes: t2, sha256: n }) => ({ path: e2, bytes: t2, sha256: n })) } });
  }
  initializeWorker() {
    let e = this.request({ type: `initialize`, toolchains: this.toolchains }, zt);
    return e.catch(() => void 0), e;
  }
  onProgress(e) {
    return this.assertActive(), this.progressListeners.add(e), () => this.progressListeners.delete(e);
  }
  onTrace(e) {
    return this.assertActive(), this.traceListeners.add(e), () => this.traceListeners.delete(e);
  }
  ready() {
    return this.assertActive(), this.readyPromise;
  }
  async build(e, t) {
    if (this.assertActive(), assertValidProject(e), assertCompilerCacheKey(t), toolchainProfileSource(this.toolchains, e.config.language, e.config.target, e.config.optimization), this.activeOperation) throw Error(`BrowserCompiler accepts one active operation at a time.`);
    let n = et2(e), a = nt(e), o = mt(e), s = o > 0, c = e.config.language === `go`, l = { kind: `build` };
    this.activeOperation = l;
    let u = this.outputReadyClangStages > 0 && (!n || this.outputReadyClangStages + a > 8), d = this.outputReadyRustStages > 0 && (!s || this.outputReadyRustStages + o > 4), ee = this.retainedGoStage && !c, f, m = false;
    try {
      (u || d || ee) && (await this.quiesceAndReplaceWorker(Error(`Compiler Worker recycled at the output-ready stage boundary.`)), this.activeOperation = l);
      let r = this.generation;
      if (await this.readyPromise, this.assertActive(), r !== this.generation || (await this.acquireToolchain(e), this.assertActive(), r !== this.generation)) throw Error(`Browser compilation was superseded by a Worker replacement.`);
      f = this.worker;
      let i = await this.request({ type: `build`, project: e, cacheKey: t }, ft(e.config.language));
      return n ? (this.outputReadyClangStages += rt(i, a), m = true) : s ? (this.outputReadyRustStages += o, m = true) : c && (this.retainedGoStage = true, m = true), i;
    } finally {
      this.activeOperation === l && (this.activeOperation = void 0), !this.disposed && f && this.worker === f && !m && this.replaceWorker(Error(`Compiler Worker recycled after isolated build.`));
    }
  }
  async clearToolchainCache() {
    if (this.assertActive(), this.activeOperation) throw Error(`BrowserCompiler accepts one active operation at a time.`);
    let e = { kind: `cache-clear` };
    this.activeOperation = e, this.stopWorker(Error(`Compiler Worker recycled before clearing caches.`));
    let n = this.generation;
    this.acquiredToolchains.clear();
    try {
      let e2 = await caches.keys();
      if (await Promise.all([...e2.filter((e3) => e3 === WASM_OJ_STORAGE.toolchainCache).map((e3) => caches.delete(e3)), jt()]), this.assertActive(), n !== this.generation || (this.installWorker(), await this.readyPromise, this.assertActive(), n !== this.generation)) throw Error(`Compiler cache clearing was superseded by a lifecycle change.`);
    } finally {
      !this.disposed && n === this.generation && this.workerDormant && this.installWorker(), this.activeOperation === e && (this.activeOperation = void 0);
    }
  }
  cancel() {
    this.disposed || this.activeOperation?.kind !== `cache-clear` && this.replaceWorker(Error(`Compilation cancelled.`));
  }
  restart() {
    if (this.assertActive(), this.activeOperation?.kind === `cache-clear`) throw Error(`Cannot restart BrowserCompiler while clearing its cache.`);
    this.replaceWorker(Error(`Compiler worker restarted.`));
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true, this.generation += 1, this.workerDormant = true, this.activeOperation = void 0, this.worker.terminate();
    let e = Error(`Compiler client disposed.`);
    this.acquisition?.abort(e), this.acquisition = void 0;
    for (let t of this.pending.values()) t.timer && clearTimeout(t.timer), t.reject(e);
    this.pending.clear(), this.progressListeners.clear(), this.traceListeners.clear();
  }
  createWorker() {
    let e = gt(ht, { name: `wasm-oj-compiler` });
    e.addEventListener(`message`, (t2) => {
      !this.disposed && !this.workerDormant && this.worker === e && this.handleMessage(t2.data);
    });
    let t = (t2) => {
      if (this.disposed || this.workerDormant || this.worker !== e) return;
      let n = this.workerInitialized;
      this.stopWorker(t2), n && this.installWorker();
    };
    return e.addEventListener(`error`, (e2) => t(Error(e2.message || `The compiler worker crashed.`))), xt(e, t), e;
  }
  replaceWorker(e) {
    this.stopWorker(e), this.installWorker();
  }
  async quiesceAndReplaceWorker(e) {
    let t = this.generation;
    try {
      await this.request({ type: `quiesce` }, Bt);
    } catch (e2) {
      let n = e2 instanceof Error ? e2 : Error(String(e2));
      throw !this.disposed && t === this.generation && this.replaceWorker(n), Error(`Compiler could not establish a quiescent Worker boundary.`, { cause: n });
    }
    if (this.assertActive(), t !== this.generation) throw Error(`Compiler quiescence was superseded by a lifecycle change.`);
    this.stopWorker(e), this.installWorker();
  }
  async acquireToolchain(e) {
    let { language: t, target: n, optimization: r } = e.config, i = t === `cpp` && e.files.some((e2) => e2.path.slice(e2.path.lastIndexOf(`/`) + 1) === `wasm-oj.pch.hpp` && isToolchainLibcxxPchHeader(e2.content)), a = JSON.stringify([t, n, r, i]);
    if (this.acquiredToolchains.has(a)) return;
    let o = new AbortController();
    this.acquisition = o;
    try {
      await Et(this.toolchains, { language: t, target: n, optimization: r, libcxxPrecompiledHeader: i, signal: o.signal, onProgress: ({ loadedBytes: e2, totalBytes: t2 }) => {
        let n2 = { phase: `loading-toolchain`, label: `Downloading pinned toolchain`, progress: t2 > 0 ? e2 / t2 : 1 };
        for (let e3 of this.progressListeners) e3(n2);
      } });
    } finally {
      this.acquisition === o && (this.acquisition = void 0);
    }
    this.acquiredToolchains.add(a);
  }
  stopWorker(e) {
    this.acquisition?.abort(e), this.acquisition = void 0, this.generation += 1, this.workerDormant = true, this.activeOperation?.kind === `build` && (this.activeOperation = void 0), this.worker.terminate();
    for (let t of this.pending.values()) t.timer && clearTimeout(t.timer), t.reject(e);
    this.pending.clear(), this.outputReadyClangStages = 0, this.outputReadyRustStages = 0, this.retainedGoStage = false, this.workerInitialized = false;
  }
  installWorker() {
    this.worker = this.createWorker(), this.workerDormant = false, this.readyPromise = this.initializeWorker();
  }
  assertActive() {
    if (this.disposed) throw Error(`BrowserCompiler is disposed.`);
  }
  request(e, t) {
    this.assertActive();
    let n = crypto.randomUUID();
    return new Promise((r, i) => {
      let a = { resolve: r, reject: i };
      a.timer = setTimeout(() => {
        if (!this.pending.delete(n)) return;
        let e2 = Error(`Compiler request exceeded the ${t} ms browser boundary.`);
        i(e2), this.disposed || this.replaceWorker(e2);
      }, t), this.pending.set(n, a);
      try {
        this.worker.postMessage({ ...e, requestId: n });
      } catch (e2) {
        this.pending.delete(n), a.timer && clearTimeout(a.timer), i(e2 instanceof Error ? e2 : Error(String(e2)));
      }
    });
  }
  handleMessage(e) {
    if (e.type === `progress`) {
      for (let t2 of this.progressListeners) t2(e.progress);
      return;
    }
    if (e.type === `compile-trace`) {
      for (let t2 of this.traceListeners) t2(e.requestId, e.event);
      return;
    }
    let t = this.pending.get(e.requestId);
    if (t) switch (this.pending.delete(e.requestId), t.timer && clearTimeout(t.timer), e.type) {
      case `ready`:
        this.workerInitialized = true, t.resolve(void 0);
        break;
      case `quiesced`:
        t.resolve(void 0);
        break;
      case `build-result`:
        t.resolve(e.result);
        break;
      case `error`:
        t.reject(Object.assign(Error(e.message), { code: e.code, stack: e.stack }));
    }
  }
};
var Ht = `` + new URL(`assets/runner.worker-BEbZIYKj.js`, import.meta.url).href;
var Ut = Object.freeze({ count: 16, sourceBytes: 1048576 });
var Wt = `createRuntimeDriver`;
var Gt = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function Kt(e, t) {
  if (!Array.isArray(e)) throw TypeError(`Browser runtime-driver plug-ins must be an array.`);
  if (e.length > Ut.count) throw RangeError(`At most ${Ut.count} browser runtime-driver plug-ins are allowed.`);
  if (e.length === 0) return [];
  let n = Yt(t, `Browser runtime-driver plug-in base URL`), r = /* @__PURE__ */ new Set();
  return e.map((e2, t2) => {
    if (!e2 || typeof e2 != `object` || Array.isArray(e2)) throw TypeError(`Browser runtime-driver plug-in ${t2} must be an object.`);
    let i = qt(e2.id, `Browser runtime-driver plug-in ${t2} ID`);
    if (r.has(i)) throw Error(`Browser runtime-driver plug-in '${i}' is declared more than once.`);
    if (r.add(i), typeof e2.moduleUrl != `string` || !e2.moduleUrl || e2.moduleUrl !== e2.moduleUrl.trim()) throw TypeError(`Browser runtime-driver plug-in '${i}' moduleUrl must be a non-empty trimmed string.`);
    let a = Yt(new URL(e2.moduleUrl, n).href, `Browser runtime-driver plug-in '${i}' module URL`);
    if (a.origin !== n.origin) throw Error(`Browser runtime-driver plug-in '${i}' must be loaded from ${n.origin}.`);
    if (a.username || a.password || a.hash) throw Error(`Browser runtime-driver plug-in '${i}' URL cannot contain credentials or a fragment.`);
    if (typeof e2.sha256 != `string` || !/^[0-9a-f]{64}$/.test(e2.sha256)) throw Error(`Browser runtime-driver plug-in '${i}' SHA-256 must be lowercase hexadecimal.`);
    let o = Jt(e2.exportName ?? Wt, i);
    return Object.freeze({ id: i, moduleUrl: a.href, sha256: e2.sha256, ...o === Wt ? {} : { exportName: o } });
  });
}
function qt(e, t) {
  if (typeof e != `string` || !e || e !== e.trim() || e.length > 128) throw Error(`${t} must be non-empty, trimmed, and at most 128 characters.`);
  return e;
}
function Jt(e, t) {
  if (typeof e != `string` || !Gt.test(e) || e.length > 128) throw Error(`Browser runtime-driver plug-in '${t}' exportName must be an ASCII JavaScript identifier.`);
  return e;
}
function Yt(e, t) {
  let n;
  try {
    n = new URL(e);
  } catch {
    throw Error(`${t} must be a valid absolute URL.`);
  }
  if (n.protocol !== `http:` && n.protocol !== `https:`) throw Error(`${t} must use HTTP or HTTPS.`);
  return n;
}
var Xt = 12e4;
var Zt = 3e5;
function Qt(e) {
  return e.language === `python` ? Zt : Xt;
}
var G = 12e4;
var $t = class {
  worker;
  pending = /* @__PURE__ */ new Map();
  progressListeners = /* @__PURE__ */ new Set();
  streamListeners = /* @__PURE__ */ new Set();
  readyPromise;
  toolchains;
  additionalCostBaselines;
  runtimeDriverPlugins;
  costBaselines;
  disposed = false;
  activeOperation;
  inFlightOperations = /* @__PURE__ */ new Set();
  generation = 0;
  workerInitialized = false;
  constructor(e) {
    if (!e || typeof e != `object`) throw TypeError(`BrowserRunner requires explicit toolchain options.`);
    this.toolchains = snapshotBrowserToolchainSources(e.toolchains), this.additionalCostBaselines = Object.freeze({ ...e.additionalCostBaselines }), this.runtimeDriverPlugins = e.runtimeDriverPlugins?.length ? Kt(e.runtimeDriverPlugins, location.href) : [], this.costBaselines = createExtendedCostBaselineRegistry(this.additionalCostBaselines), this.worker = this.createWorker(), this.readyPromise = this.initializeWorker();
  }
  initializeWorker() {
    let e = this.request({ type: `initialize`, toolchains: this.toolchains, additionalCostBaselines: this.additionalCostBaselines, runtimeDriverPlugins: this.runtimeDriverPlugins }, G);
    return e.catch(() => void 0), e;
  }
  onProgress(e) {
    return this.assertActive(), this.progressListeners.add(e), () => this.progressListeners.delete(e);
  }
  onStream(e) {
    return this.assertActive(), this.streamListeners.add(e), () => this.streamListeners.delete(e);
  }
  ready() {
    return this.assertActive(), this.readyPromise;
  }
  run(e, t) {
    return this.track(this.runOperation(e, t));
  }
  interact(e, t, n) {
    return this.track(this.interactOperation(e, t, n));
  }
  async interactOperation(e, t, r) {
    if (this.assertActive(), this.activeOperation) throw Error(`BrowserRunner accepts one active operation at a time.`);
    let i = { kind: `interact` };
    this.activeOperation = i;
    let a = this.generation;
    try {
      if (await this.readyPromise, this.assertActive(), a !== this.generation) throw Error(`Browser interaction was superseded by a Worker replacement.`);
      let i2 = performance.now(), o = resolveArtifactCostBudget(e, r.contestant.resources.instructionBudget, this.costBaselines), s = resolveArtifactCostBudget(t, r.interactor.resources.instructionBudget, this.costBaselines), c = Math.min(r.contestant.resources.wallTimeLimitMs, r.interactor.resources.wallTimeLimitMs);
      return await this.request({ type: `interact`, contestant: e, interactor: t, config: r }, c, () => ({ contestant: { code: 137, stderr: `Interactive wall-time limit ${c} ms exceeded.`, termination: `wall-time-limit`, metrics: unavailableExecutionMetrics(o, WEIGHTED_METER_MODEL) }, interactor: { code: 137, stderr: `Interactive wall-time limit ${c} ms exceeded.`, termination: `wall-time-limit`, metrics: unavailableExecutionMetrics(s, WEIGHTED_METER_MODEL) }, contestantToInteractor: ``, interactorToContestant: ``, durationMs: performance.now() - i2, determinism: { ...r.determinism } }), Math.max(Qt(e), Qt(t)));
    } finally {
      this.activeOperation === i && (this.activeOperation = void 0);
    }
  }
  async runOperation(e, t) {
    if (this.assertActive(), this.activeOperation) throw Error(`BrowserRunner accepts one active operation at a time.`);
    let r = { kind: `run` };
    this.activeOperation = r;
    let i = this.generation;
    try {
      if (await this.readyPromise, this.assertActive(), i !== this.generation) throw Error(`Browser execution was superseded by a Worker replacement.`);
      let r2 = performance.now(), a = resolveArtifactCostBudget(e, t.resources.instructionBudget, this.costBaselines);
      return await this.request({ type: `run`, artifact: e, config: t }, t.resources.wallTimeLimitMs, () => ({ code: 137, stdout: ``, stderr: `Wall-time limit ${t.resources.wallTimeLimitMs} ms exceeded.`, files: {}, executionDurationMs: t.resources.wallTimeLimitMs, durationMs: performance.now() - r2, determinism: { ...t.determinism }, resources: { ...t.resources }, termination: `wall-time-limit`, metrics: unavailableExecutionMetrics(a, WEIGHTED_METER_MODEL) }), Qt(e));
    } finally {
      this.activeOperation === r && (this.activeOperation = void 0);
    }
  }
  clearRuntimeCache() {
    return this.track(this.clearRuntimeCacheOperation());
  }
  async clearRuntimeCacheOperation() {
    if (this.assertActive(), this.activeOperation) throw Error(`BrowserRunner accepts one active operation at a time.`);
    let e = { kind: `cache-clear` };
    this.activeOperation = e;
    let t = this.generation;
    try {
      if (await this.readyPromise, this.assertActive(), t !== this.generation) throw Error(`Runtime cache clearing was superseded by a Worker replacement.`);
      await this.request({ type: `clear-runtime-cache` }, G);
    } finally {
      this.activeOperation === e && (this.activeOperation = void 0);
    }
  }
  cancel() {
    this.disposed || this.activeOperation?.kind !== `cache-clear` && this.replaceWorker(Error(`Execution cancelled.`));
  }
  async cancelAndWait() {
    for (this.cancel(); this.inFlightOperations.size > 0; ) await Promise.allSettled([...this.inFlightOperations]);
  }
  restart() {
    if (this.assertActive(), this.activeOperation?.kind === `cache-clear`) throw Error(`Cannot restart BrowserRunner while clearing its cache.`);
    this.replaceWorker(Error(`Runner worker restarted.`));
  }
  dispose() {
    this.disposed || (this.disposed = true, this.generation += 1, this.activeOperation = void 0, this.worker.terminate(), this.rejectAll(Error(`Runner client disposed.`)), this.progressListeners.clear(), this.streamListeners.clear());
  }
  createWorker() {
    let e = gt(Ht, { name: `wasm-oj-runner` });
    e.addEventListener(`message`, (t2) => {
      !this.disposed && this.worker === e && this.handleMessage(t2.data);
    });
    let t = (t2) => {
      if (this.disposed || this.worker !== e) return;
      let n = this.workerInitialized;
      this.stopWorker(t2), n && this.installWorker();
    };
    return e.addEventListener(`error`, (e2) => t(Error(e2.message || `The runner worker crashed.`))), xt(e, t), e;
  }
  rejectAll(e) {
    for (let t of this.pending.values()) K(t), t.reject(e);
    this.pending.clear();
  }
  replaceWorker(e) {
    this.stopWorker(e), this.installWorker();
  }
  stopWorker(e) {
    this.generation += 1, (this.activeOperation?.kind === `run` || this.activeOperation?.kind === `interact`) && (this.activeOperation = void 0), this.worker.terminate(), this.rejectAll(e), this.workerInitialized = false;
  }
  installWorker() {
    this.worker = this.createWorker(), this.readyPromise = this.initializeWorker();
  }
  assertActive() {
    if (this.disposed) throw Error(`BrowserRunner is disposed.`);
  }
  track(e) {
    return this.inFlightOperations.add(e), e.then(() => this.inFlightOperations.delete(e), () => this.inFlightOperations.delete(e)), e;
  }
  request(e, t, n, r = G) {
    this.assertActive();
    let i = crypto.randomUUID();
    return new Promise((a, o) => {
      let s = { resolve: a, reject: o, timeoutMs: t, timeoutResult: n };
      this.pending.set(i, s), n ? s.boundaryTimer = setTimeout(() => {
        if (!this.pending.delete(i)) return;
        let e2 = Error(`Runner runtime preparation exceeded the ${r} ms browser boundary.`);
        o(e2), this.disposed || this.replaceWorker(e2);
      }, r) : t !== void 0 && (s.boundaryTimer = setTimeout(() => {
        if (!this.pending.delete(i)) return;
        let e2 = Error(`Runner request exceeded the ${t} ms browser boundary.`);
        o(e2), this.disposed || this.replaceWorker(e2);
      }, t));
      try {
        this.worker.postMessage({ ...e, requestId: i });
      } catch (e2) {
        this.pending.delete(i), K(s), o(e2 instanceof Error ? e2 : Error(String(e2)));
      }
    });
  }
  handleMessage(e) {
    if (e.type === `progress`) {
      for (let t2 of this.progressListeners) t2(e.progress);
      e.progress.phase === `running` && this.startWallTimer(e.requestId), e.progress.phase === `packaging` && this.finishWallTimer(e.requestId);
      return;
    }
    if (e.type === `stream`) {
      for (let t2 of this.streamListeners) t2(e.stream, e.chunk);
      return;
    }
    let t = this.pending.get(e.requestId);
    if (t) switch (this.pending.delete(e.requestId), K(t), e.type) {
      case `ready`:
        this.workerInitialized = true, t.resolve(void 0);
        break;
      case `run-result`:
        t.resolve(e.result);
        break;
      case `interactive-result`:
        t.resolve(e.result);
        break;
      case `runtime-cache-cleared`:
        t.resolve(void 0);
        break;
      case `error`:
        t.reject(Object.assign(Error(e.message), { code: e.code, stack: e.stack }));
    }
  }
  finishWallTimer(e) {
    let t = this.pending.get(e);
    !t || t.executionTimer === void 0 || t.executionFinished || (K(t), t.executionFinished = true, t.boundaryTimer = setTimeout(() => {
      if (!this.pending.delete(e)) return;
      let n = Error(`Runner result collection exceeded the ${G} ms browser boundary.`);
      t.reject(n), this.disposed || this.replaceWorker(n);
    }, G));
  }
  startWallTimer(e) {
    let t = this.pending.get(e);
    !t || t.executionTimer || t.executionFinished || t.timeoutMs === void 0 || !t.timeoutResult || (t.boundaryTimer &&= (clearTimeout(t.boundaryTimer), void 0), t.executionTimer = setTimeout(() => {
      let t2 = this.pending.get(e);
      if (!t2 || !t2.timeoutResult) return;
      this.pending.delete(e);
      let n = t2.timeoutResult();
      this.replaceWorker(Error(`Runner worker replaced after wall-time termination.`)), t2.resolve(n);
    }, t.timeoutMs));
  }
};
function K(e) {
  e.boundaryTimer && clearTimeout(e.boundaryTimer), e.executionTimer && clearTimeout(e.executionTimer), e.boundaryTimer = void 0, e.executionTimer = void 0;
}
var en = new TextEncoder();
var tn = en.encode(`wasm-oj/runtime-bundle-payload\0`);
var nn = 1;
var rn = 2;
var an = 8;
function on(e) {
  if (e.kind === `wasm`) return e.bytes;
  if (e.kind !== `runtime-bundle`) throw Error(`Unsupported artifact payload kind '${String(e.kind)}'.`);
  let t = I(e.files), n = [tn, cn(t.length, `Runtime bundle file count`)];
  for (let [e2, r] of t) {
    let t2 = en.encode(e2), i, a;
    if (typeof r == `string`) i = nn, a = en.encode(r);
    else if (r instanceof Uint8Array) i = rn, a = r;
    else throw Error(`Runtime bundle file '${e2}' must contain text or Uint8Array bytes.`);
    n.push(cn(t2.byteLength, `Runtime bundle path '${e2}' byte length`), t2, Uint8Array.of(i), cn(a.byteLength, `Runtime bundle file '${e2}' byte length`), a);
  }
  return ln(n);
}
function sn(e) {
  return L(on(e));
}
function cn(e, t) {
  if (!Number.isSafeInteger(e) || e < 0) throw RangeError(`${t} must be a non-negative safe integer.`);
  let n = new Uint8Array(an);
  return new DataView(n.buffer).setBigUint64(0, BigInt(e), false), n;
}
function ln(e) {
  let t = e.reduce((e2, t2) => {
    let n2 = e2 + t2.byteLength;
    if (!Number.isSafeInteger(n2)) throw RangeError(`Artifact payload framing exceeds the safe integer range.`);
    return n2;
  }, 0), n = new Uint8Array(t), r = 0;
  for (let t2 of e) n.set(t2, r), r += t2.byteLength;
  return n;
}
var un = `weighted`;
Object.freeze({ instructionBudget: 1e10, logicalTimeLimitMs: 6e4, memoryLimitBytes: 268435456, outputLimitBytes: 4194304, filesystemWriteLimitBytes: 67108864, filesystemEntryLimit: 4096, wallTimeLimitMs: 6e4 }), new TextEncoder(), Object.freeze({ runtimeCoreWasmSha256: `077aa936a3382a242eee7222fc17369769cb5ad265303d730ffc45ee192367e9`, runtimeSourceRootSha256: `c65b3bbcad41359f86b8f1d1315af8f079b44f0e9084ace0d6d50c0ec418415b`, wasmerNativeVersion: `7.2.1`, wasmerSdkVersion: `0.10.0`, wasmerSdkWasmSha256: `49a6646209f5ab5e7c737eac33407d87d9a9959ac83e5ecaaab9261b2323589e`, wasmerWasixVersion: `0.702.1` });
var dn = `47684bee57aafd163b18a787fa16eed33cab3ec3c0005c3c46bb4f1803ffc835`;
function fn(e, t, n) {
  return assertLanguageIdentifier(e), [`wasm-oj-cost`, `contract-${WASM_OJ_CONTRACT_VERSION}`, encodeURIComponent(e), t, n];
}
function pn(e, t, n, r) {
  let i = isBuiltinLanguage(e) ? He(e) : r;
  if (!i || !/^[A-Za-z0-9._-]+$/.test(i)) throw Error(isBuiltinLanguage(e) ? `WASM-OJ toolchain content identity is invalid for '${e}'.` : `Downstream language '${e}' requires an explicit content identity using letters, digits, '.', '_' or '-'.`);
  return [...fn(e, t, n), `content-${i}`, `runtime-${dn}`, un].join(`:`);
}
function mn(e, t, n, r) {
  let i = `${fn(t, n, r).join(`:`)}:content-`, a = `:runtime-${dn}:${un}`;
  if (!e.startsWith(i) || !e.endsWith(a)) return false;
  let o = e.slice(i.length, -a.length);
  return !!o && /^[A-Za-z0-9._-]+$/.test(o);
}
var hn = new TextEncoder();
var gn = Object.freeze({ python: `python`, javascript: `qjs`, typescript: `qjs` });
function q(e, t, n = 16384) {
  if (typeof e != `string` || !e || e !== e.trim() || e.length > n) throw Error(`${t} must be a non-empty, trimmed string of at most ${n} characters.`);
}
function _n(e) {
  return JSON.stringify({ schema: WASM_OJ_SCHEMAS.runtimeBundle, version: WASM_OJ_CONTRACT_VERSION, name: e.name, target: e.target, language: e.language, runtime: { package: e.runtimePackage, command: e.command }, execution: { deterministic: true, contractVersion: WASM_OJ_CONTRACT_VERSION }, entry: e.entry, files: [...e.files] }, null, 2);
}
function vn(e, t, n, r) {
  return q(e.name, `Project name`), q(t, `Runtime package`), q(n, `Runtime command`, 128), assertLanguageIdentifier(e.config.language), F(r, `Runtime bundle entry`), _n({ name: e.name, target: e.config.target, language: e.config.language, runtimePackage: t, command: n, entry: r, files: qe(e.files).map((e2) => e2.path) });
}
function yn(e) {
  let t;
  try {
    t = JSON.parse(e.manifest);
  } catch (e2) {
    throw Error(`Runtime bundle manifest is not valid JSON.`, { cause: e2 });
  }
  if (!t || typeof t != `object` || Array.isArray(t)) throw Error(`Runtime bundle manifest must be a JSON object.`);
  let n = t, r = n.runtime, i = n.execution;
  if (!r || typeof r != `object` || Array.isArray(r)) throw Error(`Runtime bundle manifest runtime must be an object.`);
  if (!i || typeof i != `object` || Array.isArray(i)) throw Error(`Runtime bundle manifest execution must be an object.`);
  let a = r, o = i;
  if (q(n.name, `Runtime bundle manifest name`), q(a.package, `Runtime bundle manifest package`), q(a.command, `Runtime bundle manifest command`, 128), n.target !== `wasip1` && n.target !== `wasix`) throw Error(`Runtime bundle manifest has an invalid target.`);
  if (typeof n.language != `string`) throw Error(`Runtime bundle manifest has an invalid language.`);
  if (assertLanguageIdentifier(n.language), typeof n.entry != `string`) throw Error(`Runtime bundle manifest has an invalid entry.`);
  if (F(n.entry, `Runtime bundle manifest entry`), !Array.isArray(n.files)) throw Error(`Runtime bundle manifest files must be an array.`);
  let s = n.files.map((e2, t2) => (F(e2, `Runtime bundle manifest file ${t2}`), e2)), c = [...s].sort((e2, t2) => e2 < t2 ? -1 : +(e2 > t2));
  if (new Set(s).size !== s.length || JSON.stringify(s) !== JSON.stringify(c)) throw Error(`Runtime bundle manifest files must be unique and canonically sorted.`);
  if (n.schema !== WASM_OJ_SCHEMAS.runtimeBundle || n.version !== WASM_OJ_CONTRACT_VERSION || o.deterministic !== true || o.contractVersion !== WASM_OJ_CONTRACT_VERSION) throw Error(`Runtime bundle manifest does not match the current WASM-OJ contract.`);
  let l = { name: n.name, target: n.target, language: n.language, runtimePackage: a.package, command: a.command, entry: n.entry, files: s };
  if (e.manifest !== _n(l)) throw Error(`Runtime bundle manifest must use the canonical WASM-OJ representation without extra fields.`);
  return l;
}
function bn(e) {
  switch (e.config.language) {
    case `c`:
    case `cpp`:
    case `go`:
    case `rust`:
      return `${e.name}.wasm`;
    case `python`:
      return `${e.name}.python-${e.config.target}.json`;
    case `javascript`:
    case `typescript`:
      return `${e.name}.${e.config.language}-${e.config.target}.json`;
    default:
      throw Error(`WASM-OJ has no built-in artifact name for '${e.config.language}'.`);
  }
}
function xn(e) {
  if (e.config.language === `python`) {
    if (!e.config.entry.endsWith(`.py`)) throw Error(`Python entry files must end in '.py'.`);
    return e.config.entry;
  }
  if (e.config.language === `typescript`) {
    if (!e.config.entry.endsWith(`.ts`)) throw Error(`TypeScript entry files must end in '.ts'.`);
    return `${e.config.entry.slice(0, -3)}.js`;
  }
  return e.config.entry;
}
function Sn(e) {
  if (e.wasmOjContract !== WASM_OJ_CONTRACT_VERSION) throw Error(`Artifact WASM-OJ contract '${String(e.wasmOjContract)}' is unsupported; expected '${WASM_OJ_CONTRACT_VERSION}'.`);
  if (q(e.id, `Artifact id`), q(e.projectId, `Artifact projectId`), q(e.cacheKey, `Artifact cacheKey`), q(e.name, `Artifact name`), typeof e.language != `string`) throw Error(`Artifact language must be a string.`);
  if (assertLanguageIdentifier(e.language), e.target !== `wasip1` && e.target !== `wasix`) throw Error(`Artifact target is invalid.`);
  if (e.optimization !== `debug` && e.optimization !== `release`) throw Error(`Artifact optimization is invalid.`);
  if (typeof e.createdAt != `number` || !Number.isFinite(e.createdAt) || e.createdAt < 0) throw Error(`Artifact createdAt must be a non-negative finite number.`);
  if (typeof e.durationMs != `number` || !Number.isFinite(e.durationMs) || e.durationMs < 0) throw Error(`Artifact durationMs must be a non-negative finite number.`);
  if (!Number.isSafeInteger(e.size) || e.size < 0) throw Error(`Artifact size must be a non-negative safe integer.`);
  if (!Array.isArray(e.toolchains)) throw Error(`Artifact toolchains must be an array.`);
  let t = e.toolchains;
  if (t.length === 0 || t.some((e2) => typeof e2 != `string` || !e2 || e2 !== e2.trim()) || new Set(t).size !== t.length) throw Error(`Artifact toolchains must be non-empty, unique, trimmed identities.`);
  if (q(e.costProfile, `Artifact costProfile`), e.dependencyLockSha256 !== void 0 && (typeof e.dependencyLockSha256 != `string` || !/^[0-9a-f]{64}$/.test(e.dependencyLockSha256))) throw Error(`Artifact dependencyLockSha256 must be lowercase SHA-256 hexadecimal.`);
}
function Cn(e) {
  if (!isBuiltinLanguage(e.language)) return;
  let t = Ue[e.language];
  if (!t.targets.includes(e.target)) throw Error(`Artifact target '${e.target}' is unsupported for built-in language '${e.language}'.`);
  if (e.kind !== t.artifact) throw Error(`Built-in '${e.language}' artifacts must use kind '${t.artifact}', not '${e.kind}'.`);
  let n = We(e.language);
  if (JSON.stringify(e.toolchains) !== JSON.stringify(n)) throw Error(`Artifact toolchains do not match the canonical '${e.language}' toolchain identities.`);
  let r = pn(e.language, e.target, e.optimization);
  if (e.costProfile !== r) throw Error(`Artifact cost profile '${e.costProfile}' does not match ${e.language}/${e.target}/${e.optimization}.`);
  if (e.kind === `runtime-bundle`) {
    let n2 = gn[e.language];
    if (e.runtimePackage !== t.runtimePackage || e.command !== n2) throw Error(`Built-in '${e.language}' artifact runtime package or command is not canonical.`);
  }
}
function wn(e) {
  q(e.runtimePackage, `Runtime bundle package`), q(e.command, `Runtime bundle command`, 128), F(e.entry, `Runtime bundle entry`), q(e.manifest, `Runtime bundle manifest`, 1048576);
  let t = I(e.files);
  for (let [e2, n2] of t) if (typeof n2 != `string` && !(n2 instanceof Uint8Array)) throw Error(`Runtime bundle file '${e2}' must contain text or Uint8Array bytes.`);
  if (!Object.hasOwn(e.files, e.entry)) throw Error(`Runtime bundle entry '${e.entry}' is not present in its files.`);
  if (e.files[`wasm-oj.manifest.json`] !== e.manifest) throw Error(`Runtime bundle must contain its exact manifest at 'wasm-oj.manifest.json'.`);
  let n = yn(e);
  if (n.target !== e.target || n.language !== e.language || n.runtimePackage !== e.runtimePackage || n.command !== e.command || n.entry !== e.entry) throw Error(`Runtime bundle manifest metadata does not match its artifact metadata.`);
  return n;
}
function Tn(e, t) {
  if (!e || typeof e != `object` || Array.isArray(e)) throw Error(`Build artifact must be an object.`);
  let n = e;
  if (Sn(n), n.kind !== `wasm` && n.kind !== `runtime-bundle`) throw Error(`Artifact kind must be 'wasm' or 'runtime-bundle'.`);
  let r = e, i, a;
  if (r.kind === `wasm`) {
    if (!(r.bytes instanceof Uint8Array)) throw Error(`Wasm artifact bytes must be a Uint8Array.`);
    a = r.bytes.byteLength;
  } else i = wn(r), a = I(r.files).reduce((e2, [, t2]) => e2 + (typeof t2 == `string` ? hn.encode(t2).byteLength : t2.byteLength), 0);
  if (r.size !== a) throw Error(`Artifact size ${r.size} does not match payload size ${a}.`);
  if (Cn(r), !isBuiltinLanguage(r.language) && !mn(r.costProfile, r.language, r.target, r.optimization)) throw Error(`Artifact cost profile '${r.costProfile}' does not match ${r.language}/${r.target}/${r.optimization}.`);
  if (!t) return;
  let { project: o, cacheKey: s } = t;
  qe(o.files);
  let c = { cacheKey: s, projectId: o.id, language: o.config.language, target: o.config.target, optimization: o.config.optimization, dependencyLockSha256: o.dependencies?.lockSha256 };
  for (let e2 of [`cacheKey`, `projectId`, `language`, `target`, `optimization`, `dependencyLockSha256`]) if (r[e2] !== c[e2]) throw Error(`Artifact ${e2} '${String(r[e2])}' does not match build identity '${String(c[e2])}'.`);
  if (!isBuiltinLanguage(o.config.language)) return;
  let l = bn(o);
  if (r.name !== l) throw Error(`Artifact name '${r.name}' does not match build identity '${l}'.`);
  if (r.kind === `runtime-bundle`) {
    let e2 = xn(o);
    if (r.entry !== e2) throw Error(`Artifact entry '${r.entry}' does not match build identity '${e2}'.`);
    let t2 = vn(o, r.runtimePackage, r.command, e2);
    if (r.manifest !== t2 || i?.name !== o.name) throw Error(`Runtime bundle manifest does not match the canonical project build identity.`);
  }
}
Object.freeze({ randomSeed: 1592594996, realtimeEpochMs: Date.UTC(2e3, 0, 1), clockStepNs: 1e6 });
var En = Object.freeze([`id`, `name`, `files`, `config`, `activeFile`, `updatedAt`]);
Object.freeze([...En, `dependencies`]), Object.freeze([`path`, `language`, `content`]), Object.freeze([`language`, `target`, `optimization`, `entry`, `args`, `stdin`, `env`, `determinism`, `resources`]), Object.freeze([`randomSeed`, `realtimeEpochMs`, `clockStepNs`]), Object.freeze([`instructionBudget`, `logicalTimeLimitMs`, `memoryLimitBytes`, `outputLimitBytes`, `filesystemWriteLimitBytes`, `filesystemEntryLimit`, `wallTimeLimitMs`]);
var Dn = `projects`;
var J = `artifacts`;
var On = /^[0-9a-f]{64}$/u;
function Y(e) {
  return new Promise((t, n) => {
    e.addEventListener(`success`, () => t(e.result), { once: true }), e.addEventListener(`error`, () => {
      n(e.error ?? Error(`IndexedDB request failed without an error.`));
    }, { once: true });
  });
}
function X(e) {
  return new Promise((t, n) => {
    e.addEventListener(`complete`, () => t(), { once: true }), e.addEventListener(`abort`, () => {
      n(e.error ?? Error(`IndexedDB transaction aborted without an error.`));
    }, { once: true }), e.addEventListener(`error`, () => {
      n(e.error ?? Error(`IndexedDB transaction failed without an error.`));
    }, { once: true });
  });
}
var Z;
function Q() {
  if (Z) return Z;
  let e = new Promise((t, n) => {
    let r = indexedDB.open(WASM_OJ_STORAGE.database, WASM_OJ_STORAGE.databaseVersion), i = false, a = (e2) => {
      i || (i = true, n(e2));
    };
    r.addEventListener(`upgradeneeded`, () => {
      let e2 = r.result;
      e2.objectStoreNames.contains(Dn) || e2.createObjectStore(Dn, { keyPath: `id` }).createIndex(`updatedAt`, `updatedAt`), e2.objectStoreNames.contains(J) || e2.createObjectStore(J, { keyPath: `cacheKey` }).createIndex(`createdAt`, `createdAt`);
    }), r.addEventListener(`success`, () => {
      let n2 = r.result;
      if (i) {
        n2.close();
        return;
      }
      i = true;
      let a2 = () => {
        Z === e && (Z = void 0);
      };
      n2.addEventListener(`versionchange`, () => {
        n2.close(), a2();
      }, { once: true }), n2.addEventListener(`close`, a2, { once: true }), t(n2);
    }, { once: true }), r.addEventListener(`error`, () => {
      a(r.error ?? Error(`Unable to open WASM-OJ storage.`));
    }, { once: true }), r.addEventListener(`blocked`, () => {
      a(Error(`WASM-OJ storage upgrade is blocked by another open tab.`));
    }, { once: true });
  });
  return Z = e, e.catch(() => {
    Z === e && (Z = void 0);
  }), e;
}
async function kn(e) {
  let t = structuredClone(e);
  Tn(t);
  let n = on(t), r = { artifact: t, byteLength: n.byteLength, cacheKey: t.cacheKey, createdAt: t.createdAt, lastAccessedAt: Date.now(), payloadSha256: await L(n) }, i = (await Q()).transaction(J, `readwrite`);
  i.objectStore(J).put(r), await X(i), await Mn(20);
}
async function An(e) {
  let t = (await Q()).transaction(J, `readonly`), n = await Y(t.objectStore(J).get(e));
  if (await X(t), n === void 0) return;
  let r;
  try {
    r = In(n, e);
  } catch (t2) {
    await Rn(e, t2);
    return;
  }
  if (await sn(r.artifact) !== r.payloadSha256) {
    await Rn(e, Error(`Artifact payload SHA-256 does not match its stored digest.`));
    return;
  }
  return await Ln(e), r.artifact;
}
async function jn(e) {
  let t = (await Q()).transaction(J, `readwrite`);
  t.objectStore(J).delete(e), await X(t);
}
async function Mn(e) {
  if (!Number.isSafeInteger(e) || e < 0) throw RangeError(`Artifact retention count must be a non-negative safe integer.`);
  let t = (await Q()).transaction(J, `readwrite`), n = t.objectStore(J);
  (await Y(n.getAll())).sort((e2, t2) => t2.createdAt - e2.createdAt).slice(e).forEach((e2) => n.delete(e2.cacheKey)), await X(t);
}
async function Nn() {
  let e = (await Q()).transaction(J, `readwrite`);
  e.objectStore(J).clear(), await X(e);
}
function In(e, t) {
  if (!e || typeof e != `object` || Array.isArray(e)) throw Error(`Persisted artifact record must be an object.`);
  let n = e, r = Object.keys(n).sort();
  if (JSON.stringify(r) !== JSON.stringify([`artifact`, `byteLength`, `cacheKey`, `createdAt`, `lastAccessedAt`, `payloadSha256`])) throw Error(`Persisted artifact record has an invalid shape.`);
  if (t !== void 0 && n.cacheKey !== t) throw Error(`Persisted artifact record cache key does not match its IndexedDB key.`);
  if (typeof n.payloadSha256 != `string` || !On.test(n.payloadSha256)) throw Error(`Persisted artifact payload digest must be a lowercase SHA-256 hexadecimal string.`);
  if (!Number.isSafeInteger(n.byteLength) || n.byteLength < 0 || !Number.isSafeInteger(n.lastAccessedAt) || n.lastAccessedAt < 0) throw Error(`Persisted artifact storage metadata is invalid.`);
  let i = n.artifact;
  if (Tn(i), i.cacheKey !== n.cacheKey || i.createdAt !== n.createdAt) throw Error(`Persisted artifact index fields do not match the artifact metadata.`);
  return n;
}
async function Ln(e) {
  let t = (await Q()).transaction(J, `readwrite`), n = t.objectStore(J), r = await Y(n.get(e));
  if (r !== void 0) {
    let t2 = In(r, e);
    n.put({ ...t2, lastAccessedAt: Date.now() });
  }
  await X(t);
}
async function Rn(e, t) {
  console.warn(`Ignoring invalid cached artifact '${e}'.`, t);
  try {
    await jn(e);
  } catch (t2) {
    console.warn(`Unable to evict invalid cached artifact '${e}'.`, t2);
  }
}
var zn = class extends Engine {
  dependencyCache;
  constructor(e, t, n, r, i) {
    super({ compiler: e, runner: t, artifactStore: r ? { load: An, save: kn, delete: jn, clear: Nn } : void 0, dependencyManager: createDefaultDependencyManager(n, { networkAuthorizer: i }) }), this.dependencyCache = n;
  }
  dispose() {
    super.dispose(), this.dependencyCache.close();
  }
};
async function Bn(e) {
  if (!e || typeof e != `object`) throw TypeError(`createBrowserEngine requires explicit toolchain options.`);
  let t = snapshotBrowserToolchainSources(e.toolchains), n, r, i, a;
  try {
    return i = new V(), n = new Vt({ toolchains: t }), r = new $t({ toolchains: t, additionalCostBaselines: e.additionalCostBaselines, runtimeDriverPlugins: e.runtimeDriverPlugins }), a = new zn(n, r, i, e.artifactCache !== false, e.dependencyNetworkAuthorizer), await a.ready(), a;
  } catch (e2) {
    throw a ? a.dispose() : (r?.dispose(), n?.dispose(), i?.close()), e2;
  }
}

// node_modules/@wasm-oj/toolchain-go/dist/index.js
var descriptor = deepFreeze2({
  "schema": "wasm-oj-v2/toolchain-package",
  "id": "go",
  "version": "1.26.5",
  "wasmOjContract": 2,
  "languages": [
    "go"
  ],
  "profiles": [
    {
      "language": "go",
      "target": "wasip1",
      "optimization": "debug"
    },
    {
      "language": "go",
      "target": "wasip1",
      "optimization": "release"
    }
  ],
  "assets": [
    {
      "path": "/toolchains/go-1.26.5-wasip1.manifest.json",
      "bytes": 67888,
      "sha256": "5d784e9ca640b9525e84b598c0beb97ca110ae908568ca45f6441a441d99a262",
      "exportPath": "./assets/go-1.26.5-wasip1.manifest.json"
    },
    {
      "path": "/toolchains/go-1.26.5-wasip1.stdlib.gz.bin",
      "bytes": 29300578,
      "sha256": "aeffc384fdc624544f174ba5fc3c22395717fdbc3c4387d677d20855b6be80d8",
      "exportPath": "./assets/go-1.26.5-wasip1.stdlib.gz.bin"
    },
    {
      "path": "/toolchains/go-1.26.5-wasip1.webc.gz.bin",
      "bytes": 12412445,
      "sha256": "70a7e359884b09b2e1a622d6ac5cd6e31c334aab519e6dd80dff5e040a9e09e4",
      "exportPath": "./assets/go-1.26.5-wasip1.webc.gz.bin"
    }
  ]
});
function browserSource(baseUrl2) {
  return Object.freeze({ kind: "browser", descriptor, baseUrl: normalizeBrowserBaseUrl(baseUrl2) });
}
function normalizeBrowserBaseUrl(value) {
  if (typeof value !== "string" || !value || value !== value.trim() || value.length > 4096 || value.startsWith("//") || value.includes("#")) {
    throw new TypeError("Toolchain baseUrl must be a non-empty absolute or root-relative URL without a fragment.");
  }
  let url;
  if (value.startsWith("/")) url = new URL(value, "https://wasm-oj.invalid/");
  else {
    try {
      url = new URL(value);
    } catch {
      throw new TypeError("Toolchain baseUrl must be absolute or root-relative.");
    }
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("Toolchain baseUrl must use HTTP or HTTPS.");
  }
  if (url.username || url.password) throw new TypeError("Toolchain baseUrl must not contain credentials.");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  if (value.startsWith("/")) return `${url.pathname}${url.search}`;
  return url.href;
}
function deepFreeze2(value) {
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) deepFreeze2(nested);
    Object.freeze(value);
  }
  return value;
}

// stage/run-go.js
function sourceDiagnostics(build) {
  const diagnostics = [];
  const pattern = /^(.*?\.go):(\d+)(?::(\d+))?:\s*(.+)$/gm;
  for (const match of `${build.stdout}
${build.stderr}`.matchAll(pattern)) {
    diagnostics.push({
      severity: "error",
      file: match[1].replace(/^\/work\//, ""),
      line: Number(match[2]),
      column: Number(match[3] || 1),
      message: match[4],
      source: "go"
    });
  }
  return diagnostics.length ? diagnostics : build.diagnostics;
}
async function runGo({
  files,
  stage,
  onStatus = () => {
  },
  onOutput = () => {
  },
  signal,
  toolchainBase = new URL("./toolchains/", import.meta.url).href,
  resources = {}
}) {
  if (stage !== "prototype" && stage !== "final") throw new TypeError("Unknown exercise stage.");
  if (!files || typeof files["exercise.go"] !== "string" || typeof files["main.go"] !== "string") {
    throw new TypeError("Go execution requires exercise.go and main.go source.");
  }
  if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
  const engine = await Bn({ toolchains: [browserSource(toolchainBase)], artifactCache: false });
  const cancel = () => engine.cancel();
  const offStatus = engine.onProgress(onStatus);
  const offOutput = engine.onStream(onOutput);
  signal?.addEventListener("abort", cancel, { once: true });
  try {
    await engine.ready();
    if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
    const build = await engine.compile({
      language: "go",
      target: "wasip1",
      optimization: "release",
      entry: "main.go",
      files
    }, { cache: false });
    if (build.stdout) onOutput("stdout", build.stdout);
    if (build.stderr) onOutput("stderr", build.stderr);
    if (!build.success || !build.artifact) {
      return {
        phase: "compile",
        code: 1,
        exitCode: 1,
        stdout: build.stdout,
        stderr: build.stderr,
        diagnostics: sourceDiagnostics(build),
        termination: "compile-error"
      };
    }
    if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
    const result = await engine.run(build.artifact, {
      args: ["--stage", stage],
      stdin: "",
      resources: {
        instructionBudget: 5e9,
        logicalTimeLimitMs: 3e4,
        wallTimeLimitMs: 6e4,
        memoryLimitBytes: 536870912,
        outputLimitBytes: 4194304,
        ...resources
      }
    });
    return {
      phase: "run",
      code: result.code,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      diagnostics: build.diagnostics,
      termination: result.termination,
      trapMessage: result.trapMessage,
      durationMs: result.durationMs,
      executionDurationMs: result.executionDurationMs,
      metrics: result.metrics
    };
  } finally {
    signal?.removeEventListener("abort", cancel);
    offStatus();
    offOutput();
    engine.dispose();
  }
}
export {
  runGo
};
