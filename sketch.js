const CANVAS_W = 768;
const CANVAS_H = 1122;
const BLEED = 35;

const OUT_W = CANVAS_W + (BLEED * 2);
const OUT_H = CANVAS_H + (BLEED * 2);

const PDF_W_MM = 65;
const PDF_H_MM = 95;
const PDF_BLEED_MM = 3; // 3mm bleed z kazdej strany

const ASCII_MIN = 32;
const ASCII_MAX = 126;

const nazovPiva = document.getElementById("nazovPiva");
const typPiva = document.getElementById("typPiva");
const percento = document.getElementById("percento");
const hueSliderA = document.getElementById("hueSliderA");
const hueSliderB = document.getElementById("hueSliderB");

let margin = 74;
let img;
var logo, shape;
let FONT_A, FONT_B;
let COLOR_A, COLOR_B, COLOR_C;

let beerName;
let beerType;

let beerNameAscii = [];
let beerTypeAscii = [];

let nameValues, typeValues;
let v, idx;

let n, b, s, mixHue;

let TILES_X = 3;
let TILES_Y = 25;

let tileW, tileH;
let tileMargin;

let nameSize;
let typeSize;
let infoSize;

let SPLIT_COUNT = 4;

function preload() {
  FONT_A = loadFont("assets/TT Octosquares Trial Expanded Black.ttf");
  FONT_B = loadFont("assets/TT Octosquares Trial Medium.ttf");

  logo = loadImage("assets/DarkPipe_logo_app_x2.png");
  shape = loadImage("DarkPipe_etiketa_shape_768x1122.png");
}

function setup() {
  const c = createCanvas(CANVAS_W, CANVAS_H);
  c.parent('sketch-wrapper');

  colorMode(HSB, 360, 100, 100);
  pixelDensity(1);

  noStroke();
  imageMode(CENTER);

  // 1) obsah etikety – full rectangle
  label = createGraphics(CANVAS_W, CANVAS_H);
  label.colorMode(HSB, 360, 100, 100);
  label.noStroke();
  label.imageMode(CENTER);
  label.textAlign(CENTER, CENTER);

  tileW = label.width / TILES_X;
  tileH = label.height / TILES_Y;

  // shape.resize(CANVAS_W, CANVAS_H);

  document.getElementById("exportPdfBtn")?.addEventListener("click", exportPDF);
}

function draw() {
  clear();


  // ---------- ASCII MODUL ----------
  const nameInput = document.getElementById("nazovPiva");
  let beerName = nameInput.value || nameInput.placeholder;

  const typeInput = document.getElementById("typPiva");
  let beerType = typeInput.value || typeInput.placeholder;


  const volInput = document.getElementById("percento");
  let beerVolume = volInput.value || volInput.placeholder;

  // ASCII hodnoty
  beerNameAscii = [...beerName].map(c => c.charCodeAt(0));
  beerTypeAscii = [...beerType].map(c => c.charCodeAt(0));

  nameValues = beerNameAscii.map(v => map(v, 32, 126, 0, 1));
  typeValues = beerTypeAscii.map(v => map(v, 32, 126, 0, 1));

  let nameSum = beerNameAscii.reduce((a, b) => a + b, 0); // suma vsetkych hodnot
  let typeSum = beerTypeAscii.reduce((a, b) => a + b, 0); // suma vsetkych hodnot

  let nameAvg = beerNameAscii.reduce((a, b) => a + b, 0) / beerNameAscii.length; // priemer hodnot vsetkych 
  let typeAvg = beerTypeAscii.reduce((a, b) => a + b, 0) / beerTypeAscii.length; // priemer hodnot vsetkych 

  noiseSeed(nameAvg * 999);
  SPLIT_COUNT = constrain(beerType.length, 2, 8);
  randomSeed(typeAvg);


  // ---------- COLOR MODUL ----------
  let baseHue = hueSliderA.value;
  let compHue = hueSliderB.value;

  COLOR_A = color(baseHue, 100, 66);
  COLOR_B = color(compHue, 100, 6);
  COLOR_C = color("#E0D9CA"); // OFF WHITE cream

  // ---------- SETTINGS ----------
  tileMargin = 1.00;
  nameSize = 90;
  typeSize = 36;
  infoSize = 28;

  let nSet = map(nameAvg, 0, 270, 0, 100);

  // ---------- NOISE ----------
  let noiseScale = 0.0060;
  let noiseScaleX = noiseScale * nSet;
  let noiseScaleY = noiseScale * nSet;
  let noiseOffsetX = 0.20;
  let noiseOffsetY = 0.05;

  // ---------- PATTERN MODUL ----------
  label.clear();
  label.background(COLOR_A);
  label.noStroke();

  // PATTERN
  label.push();
  label.rectMode(CENTER);
  label.translate(label.width / 2, label.height / 2);
  label.scale(1.0);
  label.translate(-(label.width / 2) + tileW / 2, -(label.height / 2) + tileH / 2);

  for (let x = 0; x < TILES_X; x++) {
    for (let y = 0; y < TILES_Y; y++) {

      n = noise(
        x * noiseScaleX + nSet,
        y * noiseScaleY + noiseOffsetY
      );

      b = map(n, 0, 1, 0, 100);
      s = map(b, 0, 100, 0, 1.2);

      mixHue = lerpColor(COLOR_A, COLOR_B, s);

      let px = x * tileW;
      let py = y * tileH;

      let splitTile = random() < 0.25;
      if (splitTile) {

        let subTileW = tileW / SPLIT_COUNT;

        for (let i = 0; i < SPLIT_COUNT; i++) {

          let t = sin((n * typeAvg + i * 3.21) * TWO_PI);
          let sSplit = constrain(s + t * 0.12, 0.2, 1.2);

          label.fill(lerpColor(COLOR_A, COLOR_B, sSplit));

          label.rect(
            px + i * subTileW - tileW / 2 + subTileW / 2,
            py,
            subTileW + 1,
            tileH + 1
          );
        }

      } else {
        label.fill(mixHue);
        label.rect(px, py, tileW + 1, tileH + 1);
      }
    }
  }
  label.pop();

  // LOGO
  label.push();
  label.tint(COLOR_C);
  label.imageMode(CENTER);
  label.translate(label.width / 2, 180);

const LOGO_W = 170;                 // upravíš 1 číslom
const LOGO_H = LOGO_W * (logo.height / logo.width);

label.image(logo, label.width / 2, 196, LOGO_W, LOGO_H);
  
  label.pop();

  

  // NÁZOV PIVA
  label.push();
  label.fill(COLOR_C);
  label.textFont(FONT_A);
  label.textAlign(CENTER, CENTER);
  label.textSize(nameSize);
  label.textLeading(nameSize);
  label.text(beerName.toUpperCase(), label.width / 2 - 150, (label.height / 2) + 5, 300); label.pop();

  // TYP PIVA 
  label.push();
  label.fill(COLOR_C);
  label.textFont(FONT_A);
  label.textAlign(CENTER, BOTTOM);
  label.textSize(typeSize);
  label.textLeading(typeSize);
  label.text(beerType.toUpperCase(), label.width / 2 - 100, label.height - margin - 50, 200);
  label.pop();

  // INFO BLOK
  label.push();
  label.fill(COLOR_C);
  label.textFont(FONT_B);
  label.textAlign(CENTER, BOTTOM);
  label.textSize(infoSize);
  label.textLeading(infoSize * 1.3);
  label.text(beerVolume, label.width / 2, label.height - 7 - margin);
  label.pop();

  // OUTLINE s rect()
  label.push();
  label.imageMode(CENTER);
  label.rectMode(CENTER);
  label.translate(label.width / 2, label.height / 2);
  label.noFill();
  label.stroke(COLOR_A);
  label.strokeWeight(24);
  label.rect(0, 0, label.width, label.height, 0);
  label.rotate(radians(45));
  label.rect(0, 0, 1015, 1015, 0);
  label.pop();

  // OVERLAY
  label.push();
  label.rectMode(CENTER);
  label.fill(COLOR_A);
  label.translate(0, 0);
  label.rotate(radians(-45));
  label.rect(0, 0, 400, 330);
  label.pop();

  label.push();
  label.rectMode(CENTER);
  label.fill(COLOR_A);
  label.translate(width, 0);
  label.rotate(radians(45));
  label.rect(0, 0, 400, 330);
  label.pop();

  label.push();
  label.rectMode(CENTER);
  label.fill(COLOR_A);
  label.translate(0, height);
  label.rotate(radians(45));
  label.rect(0, 0, 400, 330);
  label.pop();

  label.push();
  label.rectMode(CENTER);
  label.fill(COLOR_A);
  label.translate(width, height);
  label.rotate(radians(-45));
  label.rect(0, 0, 400, 330);
  label.pop();

let buffer = label.get();
buffer.mask(shape);

push();
imageMode(CENTER);

drawingContext.imageSmoothingEnabled = true;
drawingContext.imageSmoothingQuality = 'high';

//scale(0.8);  
image(buffer, width / 2, height / 2);
pop();
}

function exportPDF() {
  // 1) vytiahni presne to, čo vidíš (label)
  let out = label.get();
  out.resize(CANVAS_W, CANVAS_H);

  const png = out.canvas.toDataURL("image/png");

  // 2) PDF s 3mm bleed-om okolo (mm) – obsah etikety ostane 1:1
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    unit: "mm",
    format: [PDF_W_MM + (PDF_BLEED_MM * 2), PDF_H_MM + (PDF_BLEED_MM * 2)],
    compress: false
  });

  // bleed pozadie vo farbe COLOR_A
  const r = Math.round(red(COLOR_A));
  const g = Math.round(green(COLOR_A));
  const b = Math.round(blue(COLOR_A));
  doc.setFillColor(r, g, b);

  doc.rect(0, 0, PDF_W_MM + (PDF_BLEED_MM * 2), PDF_H_MM + (PDF_BLEED_MM * 2), "F");

  // etiketa (povodna grafika) posunuta o bleed
  doc.addImage(png, "PNG", PDF_BLEED_MM, PDF_BLEED_MM, PDF_W_MM, PDF_H_MM);

  doc.save("etiketa.pdf");
}

