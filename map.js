/*Σε αυτόν τον κώδικα καταφέραμε να διαμορφώσουμε τον δικό μας χάρτη από το mapbox, να ορίσουμε τις συντεταγμένες των πρωτευουσών των πιο σεισμογενών χωρών και να τις απεικονίσουμε στον χάρτη και να δημιουργήσουμε την προσομοίωση των πόλεων αυτών όταν βρίσκονται σε σεισμό*/
console.log("map.js φορτώθηκε!");
let mapimg; //Μεταβλητή της εικόνας του χάρτη
let cx, cy;
let selectedCity = null;

//Array για την απόθηκευση των στοιχείων των πόλεων
let points = [
  {
    name: "Tokyo",
    lat: 35.68944,
    lon: 139.69167,
    text1: "city: Tokyo",
    text2: "date: 11.03.2011",
    text3: "tension: 9.0 richter ",
    numBuildings: 24, //Αριθμός κτιρίων
    k: 0.3, //Σταθερά ελατηρίου
    damping: 0.05, //Απόσβεση κτιρίου
    minFloors: 8, //Ελάχιστος αριθμός ορόφων
    maxFloors: 18, //Μέγιστος αριθμός ορόφων
  },
  {
    name: "Athens",
    lat: 37.983917,
    lon: 23.72936,
    text1: "city: Athens",
    text2: "date: 07.09.1999",
    text3: "tension: 5.9 richter",
    numBuildings: 20,
    k: 0.05,
    damping: 0.02,
    minFloors: 4,
    maxFloors: 7,
  },
  {
    name: "Ankara",
    lat: 39.9208,
    lon: 32.8541,
    text1: "city: Ankara",
    text2: "date: 17.08.1999",
    text3: "tension: 7.6 richter",
    numBuildings: 17,
    k: 0.15,
    damping: 0.02,
    minFloors: 5,
    maxFloors: 9,
  },
  {
    name: "City of Mexico",
    lat: 19.4326,
    lon: -99.1332,
    text1: "city: City of Mexico",
    text2: "date: 19.09.1985",
    text3: "tension: 8.0 richter",
    numBuildings: 15,
    k: 0.2,
    damping: 0.01,
    minFloors: 4,
    maxFloors: 8,
  },
  {
    name: "Santiago",
    lat: -33.4489,
    lon: -70.6693,
    text1: "city: Santiago",
    text2: "date: 27.02.2010",
    text3: "tension: 8.2 richter",
    numBuildings: 13,
    k: 0.05,
    damping: 0.03,
    minFloors: 5,
    maxFloors: 12,
  },
];
//Φτιάξαμε μία κλάση για να γενικεύσουμε κάποιες λειτουργίες για την προσομοίωση
class City {
  constructor(name, lat, lon, text1, text2, text3,restX) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.text1 = text1;
    this.text2 = text2;
    this.text3 = text3;
    this.x = 0;
    this.y = 0;
    this.buildings = [];
    this.k = 0.05;
    this.damping = 0.01;
    this.numBuildings = 10;
    this.restX=restX
  }
//Ενημέρωση των συντεταγμένων
  updatecoordinates(cx, cy) {
    this.x = mercX(this.lon) - cx;
    this.y = mercY(this.lat) - cy;
  }
//Δημιουργία βουλίτσας
  bullet() {
    fill(220, 29, 25);
    circle(this.x, this.y, 12);
    textSize(12);
    text(this.name, this.x - 15, this.y - 15);
  }
//Έλεγχος αν πατήθηκε η βουλίτσα
  isClicked(mX, mY) {
    return (
      mX < this.x + 6 && mX > this.x - 6 && mY < this.y + 6 && mY > this.y - 6
    );
  }
//Πληροφορίες σεισμού
  showInfo() {
    textSize(20);
    fill(0);
    text(this.text1, 30, 30);
    text(this.text2, 30, 55);
    text(this.text3, 30, 80);
  }
//Με αυτήν την λειτουργία ο χρήστης μπορεί να πατήσει ξανά μία πόλη και να δει πώς ταλαντώνεται σε περίπτωση σεισμού
resetBuildings() {
  let currentX = 50;
  for (let i = 0; i < this.buildings.length; i++) {
    let building = this.buildings[i];
    let restX = currentX;
    for (let j = 0; j < building.length; j++) {
      building[j].x1 = restX + j * 5;
      building[j].u = 0;
      building[j].restX = restX;
    }
    currentX += random(30, 70);
   }
  }
}

let cities = []; //Array για την αποθήκευση των πόλεων
let clearMap = false;

//Με το preload η εικόνα του χάρτη από το mapbox φορτώνεται πριν τον υπόλοιπο κώδικα
function preload() {
  mapimg = loadImage(
    `https://api.mapbox.com/styles/v1/mapbox/light-v8/static/0,0,1,0,0/${windowWidth}x${windowHeight}?access_token=${"pk.eyJ1IjoidmthbGtvdW5vdSIsImEiOiJjbWMyNnBidmwwNG50MmxzZmlmZWhuZzdyIn0.EgiLHmqPbg9gVZEc8pSptA"}`
  );
}

//Μετατροπή των συντεταγμένων σε pixel
function mercX(lon) {
  lon = radians(lon); //Η συντεταγμένη σε ακτίνια για να εφαρμόζεται η εξίσωση
  let a = (256 / PI) * pow(2, 1);
  let b = lon + PI;
  return a * b;
}

//Μετατροπή συντεταγμένων σε pixel
function mercY(lat) {
  lat = radians(lat);
  var a = (256 / PI) * pow(2, 1);
  var b = tan(PI / 4 + lat / 2);
  let c = PI - log(b);
  return a * c;
}

//setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-container');
  cx = mercX(0);
  cy = mercY(0);
  imageMode(CENTER);
  for (let p of points) {
    //Αποθηκεύουμε τις ιδιότητες των πόλεων
    let t = new City(p.name, p.lat, p.lon, p.text1, p.text2, p.text3);
    t.k = p.k;
    t.damping = p.damping;
    t.numBuildings = p.numBuildings;
    t.updatecoordinates(cx, cy);
    let buildings = []; //Array για τα κτίρια
    let currentX = 50;
    let startX =  currentX;//Ορίζουμε από που θέλουμε να ξεκινά η σχεδίαση της πόλης
    let positions=[];
    
// Φτιάχνουμε τυχαίες αποστάσεις και κρατάμε τα x
for (let i = 0; i < p.numBuildings; i++) {
 currentX += random(30, 70); //Ορίζουμε τυχαίο κενό ανάμεσα στα κτίρια
 positions.push(currentX);
}

  for (let i = 0; i < p.numBuildings; i++) {
    let restX = positions[i]; //Ορίζουμε ξεχωριστή θέση ισορροπίας για κάθε κτίριο
      let building = [];
      let floors = random(p.minFloors, p.maxFloors);
      for (let j = 0; j < floors; j++) {
        building.push({
          x1: restX + j * 5, //Ορίζουμε αρχική μετατόπιση του κάθε ορόφου ώστε να ξεκινάει με ταχύτητα την ταλάντωση
          y1: (7 * windowHeight) / 8 - j * 40,
          u: 0,
          restX: restX,
        });
      }

      buildings.push(building);
    }
    t.buildings = buildings;
    cities.push(t);
  }
}
function drawBuilding(building) {
  //Για κάθε όροφο σχεδιάζουμε μία μπάλα
  for (let i = 0; i < building.length; i++) {
    fill(0);
    strokeWeight(2);
    circle(building[i].x1, building[i].y1, 20);
    //Για κάθε όροφο εκτός του πρώτου ενώνουμε με τον επόμενο
    if (i > 0) {
      line(
        building[i - 1].x1,
        building[i - 1].y1 - 10,
        building[i].x1,
        building[i].y1 + 10
      );
    }
  }
}

//draw
function draw() {
  translate(
    width / 2,
    height / 2
  ); //Ορίζουμε με μεταβλητή το κέντρο των αξόνων για να ξέρουμε πόση απόσταση από αυτό θα έχουν τα σημεία
  //Ορίζουμε τι θα γίνει αν ισχύει η εντολή clearMap και selectedCity
  if (clearMap && selectedCity) {
    background(224, 224, 224); //Αλλάζει το background
    translate(0 - windowWidth / 2, 0 - windowHeight / 2); //Επαναφέρουμε το σημείο (0,0) πάνω αριστερά
    strokeWeight(6);
    line(0, (7 * windowHeight) / 8, windowWidth, (7 * windowHeight) / 8);//Σχεδιάζουμε την γραμμή του εδάφους
    selectedCity.showInfo();
    for (let building of selectedCity.buildings) {
      for (let i = 1; i < building.length; i++) {
        let m = building[i];
        let dx = m.x1 - m.restX; //Υπολογίζουμε την απόσταση του κάθε ορόφου από την θέση ισορροπίας
        let force = -selectedCity.k * dx - selectedCity.damping * m.u; //Υπολογίζουμε τη δύναμη που ασκείται σε κάθε μάζα
        let a = force;
        m.u += a;
        m.x1 += m.u;
      }

      drawBuilding(building);
    }
    gotomap(); //Εμφανίζουμε το τετράγωνο του return
  } else {
    //Διαφορετικά εμφανίζουμε τον χάρτη με τις βούλες
    background(255);
    image(mapimg, 0, 0);
    fill(255, 0, 0);
    for (let c of cities) {
      c.bullet();
    }
  }
}
////Ελέγχουμε τη θέση του ποντικιού και τι αλλάζει ανάλογα με αυτή
function mouseClicked() {
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;
  if (clearMap) {//Πότε πατιέται το κουμπί του return και τι γίνεται
    if (
      mouseX > 30 &&
      mouseX < 60 &&
      mouseY > windowHeight / 8 &&
      mouseY < windowHeight / 8 + 30
    ) {
      clearMap = false;
      selectedCity = null;
      return;
    }
  }

  for (let c of cities) {
    if (c.isClicked(mX, mY)) {
      clearMap = true;
      selectedCity = c;
      selectedCity.resetBuildings(); // Επαναφορά ταλάντωσης
      return;
    }
  }
}
//Σχεδιασμός του τετραγώνου του return
function gotomap() {
  fill(220, 29, 25);
  rect(30, windowHeight / 8, 30, 30);
  text("return", 70, windowHeight / 8 + 20);
}
