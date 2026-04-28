const SPREADSHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';

const SHEETS = {
  trips: 'Trips',
  points: 'Points',
  employees: 'Employees',
  settings: 'Settings',
};

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Smartpay | Учет поездок')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const trips = getOrCreateSheet_(ss, SHEETS.trips);
  trips.clear();
  trips.appendRow([
    'ID','Дата','Месяц','Сотрудник','Точка А','Точка Б','Транспорт','Километраж','Время, мин','Сумма такси','Туда и обратно','Итоговая сумма','Комментарий','Создано',
  ]);

  const points = getOrCreateSheet_(ss, SHEETS.points);
  if (points.getLastRow() === 0) {
    points.appendRow(['Название точки']);
    ['Офис Smartpay','Банк','Налоговая','Клиент','Партнер'].forEach(p => points.appendRow([p]));
  }

  const employees = getOrCreateSheet_(ss, SHEETS.employees);
  if (employees.getLastRow() === 0) {
    employees.appendRow(['ФИО сотрудника']);
    ['Умед','Азам','Чахонгир','Гуломчон'].forEach(e => employees.appendRow([e]));
  }

  const settings = getOrCreateSheet_(ss, SHEETS.settings);
  settings.clear();
  settings.appendRow(['Параметр','Значение']);
  settings.appendRow(['base_car_price_first_3_km',10]);
  settings.appendRow(['included_km',3]);
  settings.appendRow(['extra_km_price',3]);
  settings.appendRow(['free_minutes',20]);
  settings.appendRow(['extra_minute_price',0.10]);

  applyStyles_();
  return { ok:true };
}

function calculateTotal_(p){let t=0;if(p.transportType==='car'){const km=Number(p.km||0);const m=Number(p.minutes||0);const kmA=km<=0?0:10+Math.max(0,km-3)*3;const tA=Math.max(0,m-20)*0.10;t=kmA+tA;}else{t=Number(p.taxiAmount||0);}if(p.roundTrip)t*=2;return Math.round((t+Number.EPSILON)*100)/100;}

function getOrCreateSheet_(ss,n){return ss.getSheetByName(n)||ss.insertSheet(n);}