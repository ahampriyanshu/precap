// Original engineering illustrations in pen-and-ink, with one spot color.
// Inspired by the drawing approach in Supertrips; all subjects are drawn for Precap.
// Regenerate from the project root: node scripts/generate-concept-art.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const destination = fileURLToPath(
  new URL("../public/illustrations/", import.meta.url),
);
fs.mkdirSync(destination, { recursive: true });
const ink = "#171717";
const accent = "#88621e";
const path = (d, attrs = "") => `<path d="${d}" ${attrs}/>`;
const rect = (x, y, w, h, attrs = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
const circle = (x, y, r, attrs = "") =>
  `<circle cx="${x}" cy="${y}" r="${r}" ${attrs}/>`;
const ellipse = (x, y, rx, ry, attrs = "") =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${attrs}/>`;
const group = (x, y, s, body, extra = "") =>
  `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${body}</g>`;
const white = 'fill="white"';
const wash = 'fill="#f4f4f4"';
const spot = `fill="${accent}" stroke="${accent}"`;
const hatch = (x, y, w, h, step = 8) =>
  `<g opacity=".25" stroke-width=".8">${Array.from({ length: Math.ceil(w / step) }, (_, i) => path(`M${x + i * step} ${y + h}l${Math.min(h, w - i * step)} -${Math.min(h, w - i * step)}`)).join("")}</g>`;
const ground = (y = 341) =>
  `<g opacity=".4">${path(`M50 ${y}h620m-577 11h127m49-4h62m172 4h107`)}</g>`;
function book(x, y, w = 120, h = 22, label = "", angle = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle})">${path(`M0 0h${w}l12-6H12Z`, wash)}${path(`M0 0v${h}h${w}V0Z`, white)}${path(`M${w} 0l12-6v${h}l-12 6`, wash)}${path(`M5 5h${w - 12}M5 10h${w - 12}M5 ${h - 5}h${w - 12}`, 'opacity=".3" stroke-width=".7"')}${path(`M0 -2h${w}l12-6M0 ${h + 2}h${w}l12-6`, `stroke="${accent}" stroke-width="3"`)}${label ? `<text x="12" y="${h - 6}" font-size="10" fill="${ink}" stroke="none" font-family="Georgia,serif">${label}</text>` : ""}</g>`;
}
function laptop(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    rect(0, 0, 240, 150, `${white} rx="7"`) +
      rect(10, 10, 220, 127, `${white} rx="2"`) +
      circle(120, 5, 1, 'fill="#777" stroke="none"') +
      path("M0 150-32 186q0 5 10 5h284q10 0 10-5l-32-36Z", white) +
      path("M-32 186h304M12 157h216l19 23H-8Z", wash) +
      Array.from({ length: 4 }, (_, r) =>
        path(
          `M${10 - r * 5} ${161 + r * 5}h${220 + r * 10}`,
          'opacity=".4" stroke-width=".7"',
        ),
      ).join("") +
      Array.from({ length: 17 }, (_, i) =>
        path(
          `M${17 + i * 12} 157l${(i - 8) * 0.6} 23`,
          'opacity=".3" stroke-width=".7"',
        ),
      ).join("") +
      path("M91 180h58l4 6H87Z", white) +
      path(
        "m47 49-17 13 17 13m23-26 17 13-17 13m-12-32-12 38",
        `stroke="${accent}" stroke-width="2.4"`,
      ) +
      [0, 1, 2, 3]
        .map((r) =>
          path(
            `M113 ${46 + r * 16}h${[78, 59, 86, 41][r]}`,
            'stroke-width="3" opacity=".25"',
          ),
        )
        .join("") +
      path("M31 105h109m-109 12h165", 'opacity=".35"'),
  );
}
function plant(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M-25-55h50l-5 55h-40Z", white) +
      path("M-29-59h58v9h-58Z", white) +
      path("M0-60q-4-45 1-102m-1 71-25-31m25 6 27-29m-27 8-17-28") +
      path(
        "M-25-122q-36-4-32-29 29-3 32 29Zm51-23q32-1 31-29-30-5-31 29ZM1-162q-17-27 1-45 21 20-1 45Zm-18-3q-26-3-29-26 28-2 29 26Z",
        wash,
      ) +
      path("M-16-46-13-7m9-39 1 39m10-39L6-7m12-39-4 39", 'opacity=".25"'),
  );
}
function mug(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M-27-50v43q28 16 54 0v-43Z", white) +
      ellipse(0, -50, 27, 7, white) +
      ellipse(0, -50, 20, 4, `fill="${accent}" stroke="none" opacity=".25"`) +
      path("M27-39q30-6 29 13t-29 16m0-23q19-3 19 7t-19 10") +
      path("M-12-64q-10-15 0-26m15 26q11-17 0-30", 'opacity=".4"') +
      path("M-19-39v27", 'opacity=".25"'),
  );
}
function lamp(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    ellipse(0, 0, 38, 7, wash) +
      path("M-7-4 8-96-29-159m5-2 48 62L6-4", white) +
      circle(16, -98, 7, white) +
      circle(-27, -161, 6, spot) +
      path("M-44-171q-24 4-36 36l74-18q-15-23-38-18Z", white) +
      path("m-82-133 79-19", `stroke="${accent}" stroke-width="3"`) +
      path("M-40-164q-16 5-24 18", 'opacity=".3"'),
  );
}
function screen(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    rect(0, 0, 256, 176, `${white} rx="5"`) +
      rect(10, 10, 236, 143, white) +
      path("M0 160h256m-142 16-5 33h38l-5-33M92 210h73l13 9H80Z", white) +
      rect(22, 22, 212, 117, white) +
      path("M22 42h212") +
      [30, 38, 46]
        .map((x) => circle(x, 32, 1.6, `fill="${accent}" stroke="none"`))
        .join("") +
      rect(34, 55, 76, 70, wash) +
      path("m42 111 19-28 15 16 22-28", `stroke="${accent}" stroke-width="2"`) +
      circle(88, 67, 5, `fill="${accent}" stroke="none"`) +
      path("M125 61h94m-94 14h76m-76 14h85", 'opacity=".3"') +
      rect(125, 108, 52, 15, spot),
  );
}
function rack(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M0 0 32-17h110l-32 17Z", wash) +
      path("M110 0l32-17v220l-32 17Z", wash) +
      rect(0, 0, 110, 220, white) +
      [0, 1, 2, 3, 4]
        .map(
          (i) =>
            rect(9, 12 + i * 38, 92, 29, white) +
            circle(
              20,
              26 + i * 38,
              2,
              `fill="${i === 2 ? accent : ink}" stroke="none"`,
            ) +
            path(
              `M32 ${21 + i * 38}h57m-57 7h57m-57 7h57`,
              'opacity=".4" stroke-width=".9"',
            ),
        )
        .join("") +
      path("M8 220v9h13v-9m67 0v9h13v-9", white) +
      hatch(116, 11, 18, 182, 7),
  );
}
function database(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M-57-122V0c0 31 114 31 114 0v-122Z", white) +
      ellipse(0, -122, 57, 19, white) +
      path("M-57-84c0 31 114 31 114 0m-114 39c0 31 114 31 114 0") +
      ellipse(0, -122, 44, 11, 'opacity=".3"') +
      path("M-46-111v24m0 39v-27m0 66v-27", 'opacity=".3"') +
      [0, 1, 2]
        .map((i) =>
          circle(34, -96 + i * 41, 3, `fill="${accent}" stroke="none"`),
        )
        .join(""),
  );
}
function cube(x, y, s = 1, highlight = false) {
  return group(
    x,
    y,
    s,
    path(
      "M0-62 57-90l57 28-57 29Z",
      highlight ? `fill="${accent}" fill-opacity=".15"` : white,
    ) +
      path("M0-62v62l57 30v-63Z", white) +
      path("M57-33v63l57-30v-62Z", wash) +
      path("m18-71 57 29v61m-57-10 22 11", 'opacity=".35"') +
      path("M40-82 56-90l56 28-16 8Z", highlight ? spot : wash),
  );
}
function notebook(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M0 0 123-17l31 165L31 165Z", white) +
      path("M10 0 41 164") +
      Array.from({ length: 9 }, (_, i) =>
        path(`M${-3 + i * 3.4} ${13 + i * 17}q-15 4-11 10t14 4`),
      ).join("") +
      [0, 1, 2, 3, 4, 5]
        .map((i) =>
          path(`M${32 + i * 3} ${24 + i * 21}l80-11`, 'opacity=".25"'),
        )
        .join("") +
      path("m62 86 8 6 14-20", `stroke="${accent}" stroke-width="3"`),
  );
}
function board(x, y, s = 1) {
  return group(
    x,
    y,
    s,
    path("M0 0h280v166H0Z", white) +
      path("M6 6h268v154H6Z", 'opacity=".35"') +
      path("M31 166 18 212m13-46 7 46m211-46 12 46m-12-46-7 46") +
      rect(30, 38, 55, 32, white) +
      rect(113, 32, 63, 44, white) +
      rect(206, 39, 44, 30, white) +
      path(
        "M85 54h28m63 0h30M144 76v31H64v18m80-18h75v18",
        `stroke="${accent}"`,
      ) +
      rect(35, 125, 59, 25, white) +
      rect(191, 125, 59, 25, white) +
      path(
        "M39 48h28m-28 9h18M123 44h41m-41 9h32m-32 9h37M215 49h24m-24 8h16",
        'opacity=".3"',
      ),
  );
}
function deskScene() {
  return group(
    70,
    45,
    1,
    board(342, -8, 1.08) +
      lamp(211, 253, 1.08) +
      plant(915, 251, 0.96) +
      path("M70 255h935l34 18H37Z", white) +
      path("M37 273h1002v12H37Z", white) +
      path("M79 285 65 340h16l20-55m876 0 22 55h17l-17-55", white) +
      laptop(395, 91, 0.91) +
      book(104, 220, 132, 22, "", -3) +
      book(111, 199, 118, 18, "", 1) +
      mug(742, 247, 0.85) +
      notebook(785, 211, 0.26) +
      path("M280 241 318 235l-3-5-39 6Zm-4-5-11 8 15-3", white) +
      path("M44 305h95m727 0h167m-734 24h53m222 0h75", 'opacity=".25"'),
  );
}
const drawings = [
  {
    id: "engineering-desk",
    width: 1200,
    height: 410,
    title:
      "An engineer’s desk with a laptop, system sketches, books, a lamp, and a plant.",
    draw: deskScene,
  },
  {
    id: "machine-coding",
    title: "A coding workbench with a laptop, a notebook, and a pencil.",
    draw: () =>
      ground() +
      laptop(190, 119, 1.03) +
      notebook(510, 206, 0.56) +
      book(92, 293, 106, 23, "ALGORITHMS", -4) +
      path("M104 254 148 235l4 7-45 20-13 1Z", white),
  },
  {
    id: "system-basics",
    title:
      "A network workbench connects a desktop computer, a server, and a router.",
    draw: () =>
      ground() +
      screen(64, 111, 0.72) +
      rack(417, 98, 0.9) +
      path("M248 267h46v39h77m-50-72v72m96-39h-46", `stroke="${accent}"`) +
      rect(281, 289, 113, 35, white) +
      path("M283 289 298 279h112l-16 10m0 0 16-10v34l-16 11", wash) +
      [0, 1, 2, 3].map((i) => rect(293 + i * 22, 300, 14, 10, white)).join(""),
  },
  {
    id: "low-level-design",
    title:
      "Precisely fitted building blocks and a set square suggest modular software design.",
    draw: () =>
      ground() +
      cube(201, 253, 1.1, true) +
      cube(333, 189, 1.1) +
      cube(333, 302, 1.1) +
      cube(463, 253, 0.78, true) +
      path("M73 300 155 165l82 135Zm35-22h95l-48-78Z", white) +
      path("m84 282 9 5m0-20 9 5m0-20 9 5m0-20 9 5m0-20 9 5", 'opacity=".4"'),
  },
  {
    id: "high-level-design",
    title:
      "An architectural model of a connected city, with towers, smaller services, and shared paths.",
    draw: () =>
      ground(355) +
      path("M72 276 345 122l298 162-281 110Z", white) +
      [
        [148, 230, 55, 110],
        [235, 191, 63, 161],
        [345, 245, 68, 117],
        [459, 259, 56, 151],
        [337, 134, 47, 78],
      ]
        .map(([x, y, w, h], i) =>
          group(
            x,
            y,
            1,
            path(`M0 0v-${h}l${w * 0.5}-15 ${w} 28V13L${w} 28Z`, white) +
              path(`M0-${h}l${w} 28 ${w * 0.5}-15M${w} ${28 - h}V28`, wash) +
              Array.from({ length: Math.floor(h / 22) }, (_, r) =>
                path(
                  `M10 ${16 - h + r * 22}l${w - 19} 18m-${w - 19}-11 ${w - 19} 18`,
                  'opacity=".35" stroke-width=".8"',
                ),
              ).join("") +
              (i === 1
                ? path(`M0-${h}l${w} 28`, `stroke="${accent}" stroke-width="3"`)
                : ""),
          ),
        )
        .join("") +
      path(
        "m111 294 69 37 53-30 83 45 65-34m-65 34 42 22 192-105",
        `stroke="${accent}" stroke-width="2"`,
      ),
  },
  {
    id: "frontend",
    title:
      "An illustrated desktop browser, with a design notebook and a small plant.",
    draw: () =>
      ground() +
      screen(185, 93, 1.02) +
      plant(556, 331, 0.64) +
      notebook(83, 233, 0.48) +
      path("M183 329h295l-16-13H197Z", white) +
      path("M205 322h236", 'opacity=".35"'),
  },
  {
    id: "backend",
    title:
      "A server cabinet and a database, linked by a cable beside a stack of reference books.",
    draw: () =>
      ground() +
      rack(172, 90, 1.08) +
      database(449, 303, 1.06) +
      path("M293 303v30h99m-24-12v12", `stroke="${accent}" stroke-width="2"`) +
      book(515, 304, 99, 21, "DATA", -5) +
      book(520, 285, 87, 17, "SYSTEMS", -1),
  },
  {
    id: "ai-engineering",
    title: "An open reference book feeds an interconnected model chip.",
    draw: () =>
      ground() +
      path(
        "M81 211q60-29 139 7 70-43 149-24l-8 109q-65-11-141 24-72-30-142-8Z",
        white,
      ) +
      path("m220 218 0 109m-139-7-9 9q75-9 148 24 77-34 147-31l8-119", white) +
      [0, 1, 2, 3, 4]
        .map((i) =>
          path(
            `M99 ${233 + i * 15}q47-13 102 10m39-5q51-20 108-16`,
            'opacity=".3"',
          ),
        )
        .join("") +
      group(
        444,
        140,
        1,
        rect(0, 0, 120, 118, white) +
          rect(12, 12, 96, 94, wash) +
          [0, 1, 2, 3, 4, 5]
            .map((i) =>
              path(
                `M${18 + i * 17} 0v-17m0 135v17M0 ${16 + i * 17}h-17m137 0h17`,
              ),
            )
            .join("") +
          path(
            "M30 31 61 51 90 29M30 31l-2 56 33-36 29 34m-62 2 62-58m-29 22v42",
            `stroke="${accent}"`,
          ) +
          [
            [30, 31],
            [61, 51],
            [90, 29],
            [28, 87],
            [90, 85],
            [61, 93],
          ]
            .map(([x, y]) => circle(x, y, 5, white))
            .join(""),
      ) +
      path("M367 256h31v-57h29", `stroke="${accent}" stroke-dasharray="4 5"`),
  },
  {
    id: "devops",
    title:
      "Packages move along a release conveyor, with inspection tools nearby.",
    draw: () =>
      ground(352) +
      path("M92 264h475q24 0 24 25t-24 25H92q-24 0-24-25t24-25Z", white) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map(
          (i) =>
            circle(99 + i * 51, 289, 15, white) +
            circle(99 + i * 51, 289, 4, wash),
        )
        .join("") +
      path(
        "M125 314v38m12-38v38m396-38v38m12-38v38M86 265h482",
        'stroke-width="2"',
      ) +
      cube(141, 243, 0.6) +
      cube(299, 231, 0.78, true) +
      cube(469, 243, 0.6) +
      path("M104 186v-67h451v67M116 119v-12h428v12", white) +
      path("M330 120v29m-16 0h32v27h-32Z", spot) +
      path("M319 184 289 211m53-27 29 27", 'opacity=".3"'),
  },
  {
    id: "last-mile-prep",
    title:
      "A field notebook, a compass, and a magnifying glass for checking the details.",
    draw: () =>
      ground() +
      notebook(235, 114, 1.2) +
      group(
        143,
        277,
        1,
        circle(0, 0, 58, white) +
          circle(0, 0, 48, white) +
          path("m0-43 12 43-12 43-12-43Z", white) +
          path("M0-43 12 0H0Z", spot) +
          circle(0, 0, 5, white) +
          path("M-39 0h10m58 0h10M0-39v10m0 58v10", 'opacity=".45"'),
      ) +
      group(
        520,
        198,
        1,
        circle(0, 0, 48, white) +
          circle(0, 0, 40, white) +
          path("m29 39 42 59q5 9 13 3t2-13L43 30Z", wash) +
          path("M-25-24q-14 16-7 34", 'opacity=".3"'),
      ),
  },
];
for (const drawing of drawings) {
  const width = drawing.width || 720,
    height = drawing.height || 420;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${drawing.title.replaceAll("&", "&amp;")}</title><g fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawing.draw()}</g></svg>\n`;
  fs.writeFileSync(`${destination}${drawing.id}.svg`, svg);
}
console.log(`Generated ${drawings.length} original engineering illustrations.`);
