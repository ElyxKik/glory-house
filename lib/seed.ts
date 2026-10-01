import type { SchoolClass, SchoolRequest, StaffUser, Student, Transaction } from "./types";
export const seedStudents: Student[] = [
  { id:"ELV-0486",name:"Merveille Kabeya",gender:"F",className:"6e A",guardian:"Patrick Kabeya",phone:"+243 999 120 330",status:"Actif" },
  { id:"ELV-0485",name:"David Ilunga",gender:"M",className:"5e B",guardian:"Solange Ilunga",phone:"+243 815 321 441",status:"Actif" },
  { id:"ELV-0484",name:"Grâce Mukendi",gender:"F",className:"4e A",guardian:"Paul Mukendi",phone:"+243 970 231 009",status:"Actif" },
  { id:"ELV-0483",name:"Joseph Kalala",gender:"M",className:"6e A",guardian:"Marie Kalala",phone:"+243 822 119 450",status:"Inactif" }
];
export const seedClasses: SchoolClass[] = [
  { id:"CLS-01",name:"6e A",level:"Secondaire",teacher:"Mme Mulumba",students:32,capacity:34 },{ id:"CLS-02",name:"5e B",level:"Secondaire",teacher:"M. Tshibangu",students:29,capacity:30 },{ id:"CLS-03",name:"4e A",level:"Secondaire",teacher:"Mme Kanku",students:28,capacity:31 },{ id:"CLS-04",name:"3e A",level:"Secondaire",teacher:"M. Mwamba",students:30,capacity:35 }
];
export const seedRequests: SchoolRequest[] = [
  { id:"DEM-103",subject:"Renouvellement des manuels de 6e",details:"Achat de 45 manuels pour les deux classes de 6e.",category:"Pédagogie",amount:null,status:"pending_finance",requestedBy:"Direction",createdAt:"28 sept. 2026" },
  { id:"DEM-102",subject:"Réparation de la pompe à eau",details:"Intervention du technicien et remplacement de pièces.",category:"Entretien",amount:275000,status:"pending_admin",requestedBy:"Direction",createdAt:"27 sept. 2026" },
  { id:"DEM-101",subject:"Matériel de laboratoire",details:"Équipement pour les travaux pratiques.",category:"Matériel",amount:640000,status:"approved",requestedBy:"Direction",createdAt:"25 sept. 2026" }
];
export const seedTransactions: Transaction[] = [
  { id:"TRX-304",label:"Frais de scolarité — 6e A",category:"Paiement élève",amount:1850000,kind:"income",status:"approved",date:"28 sept. 2026" },{ id:"TRX-303",label:"Achat fournitures scolaires",category:"Matériel",amount:320000,kind:"expense",status:"pending",date:"28 sept. 2026" },{ id:"TRX-302",label:"Vente de jus — Cantine",category:"Cantine",amount:98500,kind:"income",status:"approved",date:"27 sept. 2026" },{ id:"TRX-301",label:"Réparation du portail",category:"Entretien",amount:150000,kind:"expense",status:"approved",date:"27 sept. 2026" }
];
export const seedUsers: StaffUser[] = [
  { id:"USR-01",name:"Anne-Marie",email:"admin@gloryhouse.cd",role:"principal_admin",active:true },{ id:"USR-02",name:"Jean Kabasele",email:"finance@gloryhouse.cd",role:"finance",active:true },{ id:"USR-03",name:"Sarah Ilunga",email:"direction@gloryhouse.cd",role:"direction",active:true }
];
