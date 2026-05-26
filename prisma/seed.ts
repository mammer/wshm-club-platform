import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function d(y: number, m: number, day: number) {
  return new Date(y, m - 1, day);
}

async function main() {
  console.log("🌱 Réinitialisation de la base de données...");
  await prisma.payment.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.galleryPhoto.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.match.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.player.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.adminUser.deleteMany();

  // ─── ADMIN ───────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash("admin", 10);
  await prisma.adminUser.create({
    data: { email: "admin@wshm.ma", password: hash, name: "Karim Bensouda" },
  });
  console.log("✓ Admin: admin / admin");

  // ─── PLAYERS ─────────────────────────────────────────────────────────────
  const allPlayers = [
    // ── SENIORS (14) ──────────────────────────────────────────────────────────
    { fullName: "Yassine El Amrani",  position: "Gardien de but",     jerseyNumber: 1,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=11", birthDate: d(2000, 3,15), phone: "0661-234-501", licenseNumber: "SEN-2025-001", cin: "BE456123", address: "12 Rue Al Quods, Madagh", nationality: "Marocaine", medicalDate: d(2025,9,10) },
    { fullName: "Karim Bensaïd",      position: "Défenseur central",  jerseyNumber: 4,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=12", birthDate: d(1999, 7,22), phone: "0661-234-502", licenseNumber: "SEN-2025-002", cin: "EC789045", address: "5 Quartier Hassani, Madagh",  nationality: "Marocaine", medicalDate: d(2025,9,12) },
    { fullName: "Omar Taoussi",       position: "Défenseur central",  jerseyNumber: 5,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=13", birthDate: d(2001, 1, 8), phone: "0661-234-503", licenseNumber: "SEN-2025-003", cin: "BK321654", address: "Douar Oulad Taoussi, Madagh",  nationality: "Marocaine", medicalDate: d(2025,9,14) },
    { fullName: "Soufiane Idrissi",   position: "Latéral gauche",     jerseyNumber: 3,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=18", birthDate: d(2000, 9,30), phone: "0661-234-504", licenseNumber: "SEN-2025-004", cin: "BE654987", address: "Hay El Wifaq, Madagh",       nationality: "Marocaine", medicalDate: d(2025,9,10) },
    { fullName: "Anas Berrada",       position: "Latéral droit",      jerseyNumber: 2,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=19", birthDate: d(2002, 4,12), phone: "0661-234-505", licenseNumber: "SEN-2025-005", cin: "BJ147258", address: "Avenue Mohammed V, Berkane", nationality: "Marocaine", medicalDate: d(2025,9,15) },
    { fullName: "Amine Chakir",       position: "Milieu défensif",    jerseyNumber: 6,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=14", birthDate: d(1998,11, 5), phone: "0661-234-506", licenseNumber: "SEN-2025-006", cin: "EC963852", address: "Rue Ibn Battouta, Madagh",   nationality: "Marocaine", medicalDate: d(2025,9,8),  notes: "Capitaine de l'équipe depuis 2024" },
    { fullName: "Rachid Benali",      position: "Milieu central",     jerseyNumber: 8,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=15", birthDate: d(1999, 6,17), phone: "0661-234-507", licenseNumber: "SEN-2025-007", cin: "BK741852", address: "Quartier Al Amal, Berkane",  nationality: "Marocaine", medicalDate: d(2025,9,10) },
    { fullName: "Mouad El Khamlichi", position: "Milieu offensif",    jerseyNumber: 10, category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=20", birthDate: d(2001, 8, 3), phone: "0661-234-508", licenseNumber: "SEN-2025-008", cin: "BE852963", address: "12 Rue Hassan II, Madagh",   nationality: "Marocaine", medicalDate: d(2025,9,11) },
    { fullName: "Hamza Ouali",        position: "Avant-centre",       jerseyNumber: 9,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=16", birthDate: d(2002, 2,28), phone: "0661-234-509", licenseNumber: "SEN-2025-009", cin: "BJ369147", address: "Hay Al Massira, Madagh",     nationality: "Marocaine", medicalDate: d(2025,9,9),  notes: "Meilleur buteur 2025-2026 (18 buts). Formé au club depuis U10." },
    { fullName: "Mehdi Zouheir",      position: "Ailier gauche",      jerseyNumber: 11, category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=17", birthDate: d(2003, 5,10), phone: "0661-234-510", licenseNumber: "SEN-2025-010", cin: "EC159357", address: "Douar Bni Znassen, Madagh",  nationality: "Marocaine", medicalDate: d(2025,9,15) },
    { fullName: "Khalid Benjelloun",  position: "Ailier droit",       jerseyNumber: 7,  category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=21", birthDate: d(2001,12,20), phone: "0661-234-511", licenseNumber: "SEN-2025-011", cin: "BK753951", address: "Rue Al Fida, Berkane",       nationality: "Marocaine", medicalDate: d(2025,9,12) },
    { fullName: "Noureddine Bakkali", position: "Milieu central",     jerseyNumber: 14, category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=22", birthDate: d(2000, 7, 9), phone: "0661-234-512", licenseNumber: "SEN-2025-012", cin: "BE246813", address: "Hay Salam, Madagh",          nationality: "Marocaine", medicalDate: d(2025,9,13) },
    { fullName: "Zakaria Filali",     position: "Défenseur central",  jerseyNumber: 15, category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=23", birthDate: d(1997, 3,14), phone: "0661-234-513", licenseNumber: "SEN-2025-013", cin: "EC135792", address: "Avenue Al Massira, Madagh",  nationality: "Marocaine", medicalDate: d(2025,9,10), notes: "Vice-capitaine. Expérience régionale." },
    { fullName: "Saad El Ouafi",      position: "Gardien remplaçant", jerseyNumber: 16, category: "SENIORS", photoUrl: "https://i.pravatar.cc/300?img=24", birthDate: d(2003,10, 7), phone: "0661-234-514", licenseNumber: "SEN-2025-014", cin: "BJ864297", address: "Rue Al Amal, Madagh",        nationality: "Marocaine", medicalDate: d(2025,9,15) },
    // ── CADETS (8) ────────────────────────────────────────────────────────────
    { fullName: "Ayoub Rachidi",      position: "Gardien",            jerseyNumber: 1,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=25", birthDate: d(2011, 4,18), phone: "0661-234-520", licenseNumber: "CAD-2025-001", parentName: "Mohamed Rachidi",   parentPhone: "0661-111-520", parentCin: "BE741963", address: "Hay El Majd, Madagh",       medicalDate: d(2025,9,5) },
    { fullName: "Hamza El Yazami",    position: "Défenseur",          jerseyNumber: 4,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=26", birthDate: d(2011, 9, 3), phone: "0661-234-521", licenseNumber: "CAD-2025-002", parentName: "Driss El Yazami",    parentPhone: "0661-111-521", parentCin: "EC852741", address: "Quartier Hassani, Madagh",  medicalDate: d(2025,9,6) },
    { fullName: "Youssef Amzil",      position: "Milieu",             jerseyNumber: 8,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=27", birthDate: d(2012, 1,25), phone: "0661-234-522", licenseNumber: "CAD-2025-003", parentName: "Hassan Amzil",       parentPhone: "0661-111-522", parentCin: "BK963852", address: "Rue Ibn Khaldoun, Berkane", medicalDate: d(2025,9,7) },
    { fullName: "Achraf Benkirane",   position: "Attaquant",          jerseyNumber: 9,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=28", birthDate: d(2011, 7,11), phone: "0661-234-523", licenseNumber: "CAD-2025-004", parentName: "Said Benkirane",     parentPhone: "0661-111-523", parentCin: "BE147369", address: "Hay Al Wifaq, Madagh",      medicalDate: d(2025,9,5) },
    { fullName: "Ilias Ghomari",      position: "Milieu",             jerseyNumber: 6,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=29", birthDate: d(2012, 3, 8), phone: "0661-234-524", licenseNumber: "CAD-2025-005", parentName: "Khalid Ghomari",     parentPhone: "0661-111-524", parentCin: "EC258147", address: "Douar Ghomara, Madagh",     medicalDate: d(2025,9,6) },
    { fullName: "Reda Bouchikhi",     position: "Défenseur",          jerseyNumber: 5,  category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=30", birthDate: d(2011,11,14), phone: "0661-234-525", licenseNumber: "CAD-2025-006", parentName: "Abdelkader Bouchikhi",parentPhone: "0661-111-525", parentCin: "BJ369258", address: "Rue Al Fath, Madagh",       medicalDate: d(2025,9,7) },
    { fullName: "Anass Chihab",       position: "Attaquant",          jerseyNumber: 11, category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=31", birthDate: d(2012, 6, 2), phone: "0661-234-526", licenseNumber: "CAD-2025-007", parentName: "Mustapha Chihab",    parentPhone: "0661-111-526", parentCin: "BE471258", address: "Hay Salam, Madagh",          medicalDate: d(2025,9,5) },
    { fullName: "Mohamed El Hansali", position: "Milieu offensif",    jerseyNumber: 10, category: "CADETS",  photoUrl: "https://i.pravatar.cc/300?img=32", birthDate: d(2011, 8,29), phone: "0661-234-527", licenseNumber: "CAD-2025-008", parentName: "Abdellah El Hansali", parentPhone: "0661-111-527", parentCin: "EC582369", address: "Rue Hassan II, Madagh",     medicalDate: d(2025,9,6) },
    // ── JUNIORS (7) ───────────────────────────────────────────────────────────
    { fullName: "Bilal Hafidi",       position: "Gardien",            jerseyNumber: 1,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=33", birthDate: d(2008, 5,22), phone: "0661-234-530", licenseNumber: "JUN-2025-001", parentName: "Ahmed Hafidi",       parentPhone: "0661-222-530", parentCin: "BE963741", address: "Hay Moulay Rachid, Madagh", medicalDate: d(2025,9,3) },
    { fullName: "Nassim Benali",      position: "Milieu",             jerseyNumber: 7,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=34", birthDate: d(2009, 2,14), phone: "0661-234-531", licenseNumber: "JUN-2025-002", parentName: "Omar Benali",        parentPhone: "0661-222-531", parentCin: "EC741963", address: "Douar Bni Mathar, Madagh",  medicalDate: d(2025,9,4) },
    { fullName: "Adam Zerrad",        position: "Attaquant",          jerseyNumber: 9,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=35", birthDate: d(2008,10, 8), phone: "0661-234-532", licenseNumber: "JUN-2025-003", parentName: "Youssef Zerrad",     parentPhone: "0661-222-532", parentCin: "BK852963", address: "Quartier Al Amal, Berkane",  medicalDate: d(2025,9,3) },
    { fullName: "Ilyas Sabir",        position: "Défenseur",          jerseyNumber: 4,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=36", birthDate: d(2009, 7,30), phone: "0661-234-533", licenseNumber: "JUN-2025-004", parentName: "Rachid Sabir",       parentPhone: "0661-222-533", parentCin: "BE159753", address: "Hay Al Massira, Madagh",     medicalDate: d(2025,9,4) },
    { fullName: "Yassir Lahlou",      position: "Milieu défensif",    jerseyNumber: 6,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=37", birthDate: d(2008,12,17), phone: "0661-234-534", licenseNumber: "JUN-2025-005", parentName: "Karim Lahlou",       parentPhone: "0661-222-534", parentCin: "EC357159", address: "Rue Al Quods, Madagh",       medicalDate: d(2025,9,3) },
    { fullName: "Othmane Zemmouri",   position: "Défenseur",          jerseyNumber: 3,  category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=38", birthDate: d(2009, 4, 5), phone: "0661-234-535", licenseNumber: "JUN-2025-006", parentName: "Hicham Zemmouri",    parentPhone: "0661-222-535", parentCin: "BJ753951", address: "Douar Zemmouri, Madagh",    medicalDate: d(2025,9,4) },
    { fullName: "Amine El Mourabit",  position: "Ailier",             jerseyNumber: 11, category: "JUNIORS", photoUrl: "https://i.pravatar.cc/300?img=39", birthDate: d(2008, 8,23), phone: "0661-234-536", licenseNumber: "JUN-2025-007", parentName: "Said El Mourabit",   parentPhone: "0661-222-536", parentCin: "BE951357", address: "Rue Ibn Sina, Berkane",      medicalDate: d(2025,9,3) },
    // ── MINIMES (6) ───────────────────────────────────────────────────────────
    { fullName: "Rayan Mansouri",     position: "Attaquant",          jerseyNumber: 9,  category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=40", birthDate: d(2013, 6,11), phone: "0661-234-540", licenseNumber: "MIN-2025-001", parentName: "Hassan Mansouri",    parentPhone: "0661-333-540", parentCin: "EC147963", address: "Hay El Wifaq, Madagh",      medicalDate: d(2025,9,1) },
    { fullName: "Youssef Lahlou",     position: "Milieu",             jerseyNumber: 6,  category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=41", birthDate: d(2013, 3,28), phone: "0661-234-541", licenseNumber: "MIN-2025-002", parentName: "Karim Lahlou",       parentPhone: "0661-333-541", parentCin: "BK369741", address: "Hay Salam, Madagh",          medicalDate: d(2025,9,1) },
    { fullName: "Zakaria Ait Omar",   position: "Gardien",            jerseyNumber: 1,  category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=42", birthDate: d(2014, 1,15), phone: "0661-234-542", licenseNumber: "MIN-2025-003", parentName: "Ali Ait Omar",       parentPhone: "0661-333-542", parentCin: "BE258741", address: "Douar Ait Omar, Madagh",    medicalDate: d(2025,9,2) },
    { fullName: "Hamza Moussaoui",    position: "Défenseur",          jerseyNumber: 4,  category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=43", birthDate: d(2013, 9, 7), phone: "0661-234-543", licenseNumber: "MIN-2025-004", parentName: "Abdelaziz Moussaoui",parentPhone: "0661-333-543", parentCin: "EC741258", address: "Quartier Hassani, Madagh",  medicalDate: d(2025,9,1) },
    { fullName: "Abdellatif Tazi",    position: "Milieu",             jerseyNumber: 7,  category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=44", birthDate: d(2014, 5,19), phone: "0661-234-544", licenseNumber: "MIN-2025-005", parentName: "Noureddine Tazi",    parentPhone: "0661-333-544", parentCin: "BJ852147", address: "Hay Al Amal, Madagh",        medicalDate: d(2025,9,2) },
    { fullName: "Imrane El Fassi",    position: "Attaquant",          jerseyNumber: 11, category: "MINIMES", photoUrl: "https://i.pravatar.cc/300?img=45", birthDate: d(2013,12, 3), phone: "0661-234-545", licenseNumber: "MIN-2025-006", parentName: "Mohamed El Fassi",   parentPhone: "0661-333-545", parentCin: "BE963258", address: "Rue Al Massira, Madagh",    medicalDate: d(2025,9,1) },
  ];

  const createdPlayers: { id: string; fullName: string; category: string }[] = [];
  for (const p of allPlayers) {
    const player = await prisma.player.create({ data: { ...p, isActive: true } });
    createdPlayers.push({ id: player.id, fullName: player.fullName, category: player.category });
  }
  console.log(`✓ ${createdPlayers.length} joueurs créés`);

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────
  // Season 2024-2025: 80% compliance
  // Season 2025-2026: 55% compliance (in-progress)
  const payments: {
    playerId: string; amount: number; paymentDate: Date;
    paymentType: string; season: string; notes: string | null; recordedBy: string;
  }[] = [];

  // Helper: random date within a range
  const rdate = (from: Date, to: Date) =>
    new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));

  const recorder = "Karim Bensouda";

  for (const player of createdPlayers) {
    const isSenior  = player.category === "SENIORS";
    const isJunior  = player.category === "JUNIORS";
    const isCadet   = player.category === "CADETS";

    // --- Saison 2024-2025 ---
    const paidS1 = Math.random() < 0.82; // 82% pay full season 1
    if (paidS1) {
      payments.push({
        playerId: player.id,
        amount: isSenior ? 400 : isJunior ? 350 : isCadet ? 300 : 250,
        paymentDate: rdate(d(2024, 9, 1), d(2024, 11, 30)),
        paymentType: "COTISATION",
        season: "2024-2025",
        notes: "Cotisation annuelle saison 2024-2025",
        recordedBy: recorder,
      });
      // Licence for most
      if (Math.random() < 0.9) {
        payments.push({
          playerId: player.id,
          amount: isSenior ? 180 : 120,
          paymentDate: rdate(d(2024, 9, 1), d(2024, 10, 15)),
          paymentType: "LICENCE",
          season: "2024-2025",
          notes: "Licence fédérale FRMF",
          recordedBy: recorder,
        });
      }
      // Equipment for some
      if (Math.random() < 0.6) {
        payments.push({
          playerId: player.id,
          amount: isSenior ? 350 : 280,
          paymentDate: rdate(d(2024, 9, 15), d(2024, 12, 31)),
          paymentType: "EQUIPEMENT",
          season: "2024-2025",
          notes: "Tenue officielle + équipement",
          recordedBy: recorder,
        });
      }
    } else if (Math.random() < 0.5) {
      // partial payment
      payments.push({
        playerId: player.id,
        amount: isSenior ? 200 : 150,
        paymentDate: rdate(d(2024, 10, 1), d(2025, 2, 28)),
        paymentType: "COTISATION",
        season: "2024-2025",
        notes: "Paiement partiel — solde en attente",
        recordedBy: recorder,
      });
    }

    // --- Saison 2025-2026 ---
    const paidS2 = Math.random() < 0.58; // 58% paid so far
    if (paidS2) {
      payments.push({
        playerId: player.id,
        amount: isSenior ? 420 : isJunior ? 370 : isCadet ? 320 : 270,
        paymentDate: rdate(d(2025, 9, 1), d(2026, 1, 31)),
        paymentType: "COTISATION",
        season: "2025-2026",
        notes: "Cotisation annuelle saison 2025-2026",
        recordedBy: recorder,
      });
      if (Math.random() < 0.85) {
        payments.push({
          playerId: player.id,
          amount: isSenior ? 190 : 130,
          paymentDate: rdate(d(2025, 9, 1), d(2025, 10, 31)),
          paymentType: "LICENCE",
          season: "2025-2026",
          notes: "Licence fédérale FRMF 2025-2026",
          recordedBy: recorder,
        });
      }
      if (Math.random() < 0.45) {
        payments.push({
          playerId: player.id,
          amount: isSenior ? 380 : 300,
          paymentDate: rdate(d(2025, 10, 1), d(2026, 3, 31)),
          paymentType: "EQUIPEMENT",
          season: "2025-2026",
          notes: "Kit complet saison 2025-2026",
          recordedBy: recorder,
        });
      }
    }
  }

  // Add specific extra payments for seniors (more realistic history)
  const hamza = createdPlayers.find((p) => p.fullName === "Hamza Ouali");
  const rachid = createdPlayers.find((p) => p.fullName === "Rachid Benali");
  if (hamza) {
    payments.push({ playerId: hamza.id, amount: 500, paymentDate: d(2026, 3, 10), paymentType: "AUTRE", season: "2025-2026", notes: "Prime performance — meilleur buteur S1", recordedBy: recorder });
  }
  if (rachid) {
    payments.push({ playerId: rachid.id, amount: 300, paymentDate: d(2026, 2, 15), paymentType: "AUTRE", season: "2025-2026", notes: "Remboursement frais déplacement Oujda", recordedBy: recorder });
  }

  for (const p of payments) {
    await prisma.payment.create({ data: { ...p, amount: p.amount } });
  }
  console.log(`✓ ${payments.length} paiements créés`);

  // ─── COACHES ─────────────────────────────────────────────────────────────
  const coaches = [
    {
      fullName: "Hassan El Fassi",
      role: "Entraîneur Principal Seniors",
      category: "SENIORS",
      photoUrl: "https://i.pravatar.cc/300?img=51",
      phone: "0661290001",
      license: "UEFA B",
      cin: "BE112233",
      birthDate: d(1975, 4, 12),
      address: "25 Rue Ibn Khaldoun, Berkane",
      nationality: "Marocaine",
      experience: "18 ans d'expérience — Ancien joueur professionnel, formé à l'INFS de Salé",
      medicalDate: d(2025, 9, 5),
      notes: "Entraîneur principal depuis 2020. Taux de victoire : 64%.",
    },
    {
      fullName: "Mourad Benchekroun",
      role: "Entraîneur Adjoint Seniors",
      category: "SENIORS",
      photoUrl: "https://i.pravatar.cc/300?img=52",
      phone: "0661290002",
      license: "Diplôme Fédéral FRMF",
      cin: "EC334455",
      birthDate: d(1980, 8, 27),
      address: "7 Hay El Wifaq, Madagh",
      nationality: "Marocaine",
      experience: "12 ans d'expérience — Spécialiste préparation physique",
      medicalDate: d(2025, 9, 6),
      notes: null,
    },
    {
      fullName: "Driss Alaoui",
      role: "Entraîneur Juniors & Cadets",
      category: "JUNIORS",
      photoUrl: "https://i.pravatar.cc/300?img=53",
      phone: "0661290003",
      license: "Diplôme Fédéral FRMF",
      cin: "BK556677",
      birthDate: d(1983, 2, 15),
      address: "Douar Alaoui, Madagh",
      nationality: "Marocaine",
      experience: "10 ans d'expérience — Spécialiste formation jeunes",
      medicalDate: d(2025, 9, 7),
      notes: "Responsable du centre de formation U17/U15.",
    },
    {
      fullName: "Khalid Amrani",
      role: "Entraîneur Minimes",
      category: "MINIMES",
      photoUrl: "https://i.pravatar.cc/300?img=54",
      phone: "0661290004",
      license: "Brevet Fédéral FRMF",
      cin: "BE778899",
      birthDate: d(1988, 6, 3),
      address: "Rue Al Fath, Berkane",
      nationality: "Marocaine",
      experience: "6 ans d'expérience — Éducateur sportif diplômé",
      medicalDate: d(2025, 9, 8),
      notes: null,
    },
  ];
  for (const c of coaches) await prisma.coach.create({ data: c });
  console.log(`✓ ${coaches.length} entraîneurs créés`);

  // ─── MATCHES ─────────────────────────────────────────────────────────────
  const matches = [
    // Seniors – Championnat 2025-26
    { homeTeam: "W.S.H.M",            awayTeam: "FUS Oujda",         homeScore: 3, awayScore: 1, matchDate: d(2026, 5, 18), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 22 },
    { homeTeam: "RSB Berkane",         awayTeam: "W.S.H.M",           homeScore: 0, awayScore: 2, matchDate: d(2026, 5, 10), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 21 },
    { homeTeam: "W.S.H.M",            awayTeam: "MCO Oujda",         homeScore: 2, awayScore: 2, matchDate: d(2026, 5, 3),  category: "SENIORS", competition: "CHAMPIONNAT", matchday: 20 },
    { homeTeam: "Chabab Ahfir",        awayTeam: "W.S.H.M",           homeScore: 0, awayScore: 1, matchDate: d(2026, 4, 26), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 19 },
    { homeTeam: "W.S.H.M",            awayTeam: "AS Nador",          homeScore: 4, awayScore: 0, matchDate: d(2026, 4, 19), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 18 },
    { homeTeam: "W.S.H.M",            awayTeam: "Wydad Berkane",     homeScore: 1, awayScore: 0, matchDate: d(2026, 4, 12), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 17 },
    { homeTeam: "MAS Fès",             awayTeam: "W.S.H.M",           homeScore: 2, awayScore: 3, matchDate: d(2026, 4, 5),  category: "SENIORS", competition: "CHAMPIONNAT", matchday: 16 },
    { homeTeam: "W.S.H.M",            awayTeam: "Olympic Khouribga", homeScore: 1, awayScore: 1, matchDate: d(2026, 3, 29), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 15 },
    { homeTeam: "Hassania Agadir",     awayTeam: "W.S.H.M",           homeScore: 1, awayScore: 2, matchDate: d(2026, 3, 22), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 14 },
    { homeTeam: "W.S.H.M",            awayTeam: "AS Saïdia",         homeScore: 3, awayScore: 0, matchDate: d(2026, 3, 15), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 13 },
    // Seniors – Coupe
    { homeTeam: "W.S.H.M",            awayTeam: "FUS Oujda",         homeScore: 2, awayScore: 0, matchDate: d(2026, 3, 8),  category: "SENIORS", competition: "COUPE", matchday: null },
    { homeTeam: "AS Berkane",          awayTeam: "W.S.H.M",           homeScore: 1, awayScore: 2, matchDate: d(2026, 2, 15), category: "SENIORS", competition: "COUPE", matchday: null },
    // Seniors – Amicaux
    { homeTeam: "W.S.H.M",            awayTeam: "Chabab Berkane",    homeScore: 3, awayScore: 2, matchDate: d(2025, 8, 20), category: "SENIORS", competition: "AMICAL", matchday: null },
    { homeTeam: "W.S.H.M",            awayTeam: "FTR Oujda",         homeScore: 1, awayScore: 0, matchDate: d(2025, 8, 10), category: "SENIORS", competition: "AMICAL", matchday: null },
    // Juniors
    { homeTeam: "W.S.H.M Juniors",    awayTeam: "RSB Berkane U17",   homeScore: 2, awayScore: 1, matchDate: d(2026, 5, 17), category: "JUNIORS", competition: "CHAMPIONNAT", matchday: 18 },
    { homeTeam: "AS Saïdia U17",      awayTeam: "W.S.H.M Juniors",   homeScore: 1, awayScore: 3, matchDate: d(2026, 5, 10), category: "JUNIORS", competition: "CHAMPIONNAT", matchday: 17 },
    { homeTeam: "W.S.H.M Juniors",    awayTeam: "MCO U17",           homeScore: 1, awayScore: 1, matchDate: d(2026, 5, 3),  category: "JUNIORS", competition: "CHAMPIONNAT", matchday: 16 },
    { homeTeam: "Chabab Ahfir U17",   awayTeam: "W.S.H.M Juniors",   homeScore: 0, awayScore: 2, matchDate: d(2026, 4, 26), category: "JUNIORS", competition: "CHAMPIONNAT", matchday: 15 },
    // Cadets
    { homeTeam: "W.S.H.M Cadets",     awayTeam: "AS Berkane U15",    homeScore: 4, awayScore: 0, matchDate: d(2026, 5, 16), category: "CADETS",  competition: "CHAMPIONNAT", matchday: 10 },
    { homeTeam: "FUS Oujda U15",      awayTeam: "W.S.H.M Cadets",    homeScore: 2, awayScore: 3, matchDate: d(2026, 5, 9),  category: "CADETS",  competition: "CHAMPIONNAT", matchday: 9  },
    // Prochains matchs (sans score)
    { homeTeam: "W.S.H.M",            awayTeam: "AS Berkane",        homeScore: null, awayScore: null, matchDate: new Date("2026-06-01T16:00:00"), category: "SENIORS", competition: "CHAMPIONNAT", matchday: 23 },
    { homeTeam: "W.S.H.M Juniors",    awayTeam: "FUS Oujda U17",    homeScore: null, awayScore: null, matchDate: new Date("2026-06-01T10:00:00"), category: "JUNIORS", competition: "CHAMPIONNAT", matchday: 19 },
  ];

  for (const m of matches) {
    await prisma.match.create({
      data: { ...m, location: m.homeTeam.startsWith("W.S.H.M") ? "Terrain Municipal Madagh" : null },
    });
  }
  console.log(`✓ ${matches.length} matchs créés`);

  // ─── MEETINGS ─────────────────────────────────────────────────────────────
  const meetings = [
    {
      title: "Assemblée Générale Ordinaire 2025",
      meetingDate: d(2025, 9, 15),
      location: "Salle des fêtes de Madagh",
      agenda: "1. Rapport moral et financier 2024-2025\n2. Approbation du budget 2025-2026\n3. Renouvellement du bureau directeur\n4. Questions diverses",
      notes: "Présence de 34 membres. Budget approuvé à l'unanimité. M. Karim Bensouda reconduit comme président.",
    },
    {
      title: "Réunion de rentrée — Saison 2025-2026",
      meetingDate: d(2025, 8, 28),
      location: "Local du club",
      agenda: "1. Programme de la saison\n2. Transferts et nouvelles recrues\n3. Planning des entraînements\n4. Logistique transport déplacements",
      notes: "Décision: 3 entraînements/semaine pour les seniors. Budget transport: 8 000 MAD.",
    },
    {
      title: "Réunion mensuelle — Octobre 2025",
      meetingDate: d(2025, 10, 12),
      location: "Local du club",
      agenda: "1. Point sur les résultats sportifs\n2. Situation des cotisations\n3. Organisation tournoi interne\n4. Divers",
      notes: "Taux de recouvrement cotisations: 42%. Rappel envoyé aux retardataires.",
    },
    {
      title: "Réunion mensuelle — Décembre 2025",
      meetingDate: d(2025, 12, 8),
      location: "Local du club",
      agenda: "1. Bilan mi-saison\n2. Mercato hivernal\n3. Préparation tournoi de Nador\n4. Cotisations: rappels",
      notes: "Victoire en coupe contre AS Berkane discutée. Recrutement de 2 seniors en janvier.",
    },
    {
      title: "Réunion mensuelle — Février 2026",
      meetingDate: d(2026, 2, 9),
      location: "Local du club",
      agenda: "1. Résultats janvier\n2. Situation financière\n3. Préparation tournoi d'été\n4. Divers",
      notes: "Annonce du Tournoi d'Été 2026. Comité organisateur formé.",
    },
    {
      title: "Réunion mensuelle — Avril 2026",
      meetingDate: d(2026, 4, 7),
      location: "Local du club",
      agenda: "1. Sprint final du championnat\n2. Inscriptions tournoi d'été\n3. Equipements\n4. Divers",
      notes: "W.S.H.M en 2e position du championnat. 3 journées restantes.",
    },
    {
      title: "Réunion de préparation Tournoi d'Été 2026",
      meetingDate: d(2026, 6, 15),
      location: "Terrain Municipal Madagh",
      agenda: "1. Programme et calendrier du tournoi\n2. Arbitrage\n3. Logistique (restauration, sécurité)\n4. Communication et sponsors",
      notes: null,
    },
    {
      title: "Réunion mensuelle — Août 2026",
      meetingDate: d(2026, 8, 10),
      location: "Local du club",
      agenda: "1. Bilan Tournoi d'Été 2026\n2. Préparation saison 2026-2027\n3. Budget prévisionnel\n4. Recrutement",
      notes: null,
    },
  ];

  for (const m of meetings) await prisma.meeting.create({ data: m });
  console.log(`✓ ${meetings.length} réunions créées`);

  // ─── BLOG ────────────────────────────────────────────────────────────────
  const posts = [
    {
      slug: "victoire-fus-oujda-mai-2026",
      titleFr: "Victoire éclatante 3-1 contre FUS Oujda !",
      titleAr: "انتصار ساحق 3-1 أمام فاس أوجدة!",
      contentFr: "<p>Le Wefak Sportif Hassanyat Madagh a livré une performance exceptionnelle lors de la 22e journée du championnat en battant le FUS Oujda 3-1. Hamza Ouali (12'), Rachid Benali (34') et Mehdi Zouheir (78') ont inscrit les buts madaghis.</p>",
      contentAr: "<p>قدّم الوفاق الرياضي الحسني لمداغ أداءً استثنائياً في الجولة 22 بتغلبه على فاس أوجدة 3-1. سجّل حمزة أوالي (12')، رشيد بن علي (34') ومهدي زهير (78').</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
      author: "Rédaction W.S.H.M", published: true, publishedAt: d(2026, 5, 18),
    },
    {
      slug: "tournoi-ete-2026-annonce",
      titleFr: "Tournoi d'Été 2026 — Inscriptions ouvertes !",
      titleAr: "دوري الصيف 2026 — التسجيل مفتوح!",
      contentFr: "<p>La 14e édition du Tournoi d'Été se tiendra du 15 au 30 juillet 2026 à Madagh. Toutes les catégories sont concernées. Inscriptions jusqu'au 30 juin !</p>",
      contentAr: "<p>الدورة 14 لدوري الصيف ستُقام من 15 إلى 30 يوليوز 2026 بمداغ. التسجيل مفتوح لجميع الفئات إلى غاية 30 يونيو!</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
      author: "Rédaction W.S.H.M", published: true, publishedAt: d(2026, 5, 15),
    },
    {
      slug: "hamza-ouali-meilleur-buteur",
      titleFr: "Hamza Ouali — 18 buts, meilleur buteur de la saison",
      titleAr: "حمزة أوالي — 18 هدفاً، هداف الموسم",
      contentFr: "<p>Avec 18 buts en championnat, Hamza Ouali est le meilleur buteur de la saison 2025-2026. Formé au club depuis l'âge de 10 ans, il est le symbole de notre académie.</p>",
      contentAr: "<p>بـ18 هدفاً في الدوري، حمزة أوالي هداف موسم 2025-2026. تكوّن في النادي منذ سن العاشرة وهو رمز أكاديميتنا.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80",
      author: "Rédaction W.S.H.M", published: true, publishedAt: d(2026, 5, 10),
    },
    {
      slug: "70-ans-histoire-wshm",
      titleFr: "70 ans de passion — L'histoire du W.S.H.M",
      titleAr: "70 عاماً من الشغف — تاريخ الوفاق الرياضي الحسني لمداغ",
      contentFr: "<p>Fondé en 1956, le W.S.H.M fête cette année ses 70 ans. Du terrain en terre battue à l'infrastructure actuelle, le chemin parcouru est immense. Le club a formé des centaines de joueurs.</p>",
      contentAr: "<p>تأسس الوفاق عام 1956 ويحتفل هذا العام بالذكرى 70. خرّج مئات اللاعبين على مدى سبعة عقود من العطاء المتواصل.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&q=80",
      author: "Rédaction W.S.H.M", published: true, publishedAt: d(2026, 5, 1),
    },
  ];
  for (const post of posts) await prisma.blogPost.create({ data: post });

  // ─── GALLERY ─────────────────────────────────────────────────────────────
  const photos = [
    { imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600", titleFr: "Match contre FUS Oujda", titleAr: "مباراة أمام فاس أوجدة", category: "Matchs", eventDate: d(2026, 5, 18) },
    { imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600", titleFr: "Tournoi d'été 2025",    titleAr: "دوري الصيف 2025",         category: "Tournois" },
    { imageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600", titleFr: "Entraînement du mardi",  titleAr: "تدريب الثلاثاء",          category: "Entraînements" },
    { imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=600", titleFr: "Remise de coupes",       titleAr: "حفل توزيع الكؤوس",        category: "Événements" },
    { imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600", titleFr: "Équipe Seniors 2025-26",titleAr: "فريق الكبار 2025-26",    category: "Équipes" },
    { imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600", titleFr: "Les Minimes en action",  titleAr: "الصغار في الميدان",        category: "Équipes" },
    { imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600", titleFr: "Victoire Coupe",      titleAr: "الفوز بالكأس",             category: "Matchs" },
    { imageUrl: "https://images.unsplash.com/photo-1600679472829-3044539ce405?w=600", titleFr: "Terrain Municipal",   titleAr: "الملعب البلدي",             category: "Infrastructure" },
  ];
  for (const p of photos) await prisma.galleryPhoto.create({ data: p });

  // ─── TOURNAMENT ──────────────────────────────────────────────────────────
  const tournament = await prisma.tournament.create({
    data: {
      nameFr: "Tournoi d'Été Madagh 2026",
      nameAr: "دوري الصيف مداغ 2026",
      tournamentDate: d(2026, 7, 15),
      registrationDeadline: d(2026, 6, 30),
      categories: "MINIMES,CADETS,JUNIORS,SENIORS",
      descriptionFr: "La 14e édition du Tournoi d'Été de Madagh. Une semaine de football festif dans l'ambiance chaleureuse de Madagh.",
      descriptionAr: "الدورة الرابعة عشرة لدوري الصيف بمداغ.",
      isOpen: true,
    },
  });

  const registrations = [
    { clubName: "RSB Berkane U17",  contactName: "Ahmed Khalil",   contactPhone: "0661300001", contactEmail: "rsb@berkane.ma",   category: "JUNIORS", playerCount: 18, status: "CONFIRMED" },
    { clubName: "AS Saïdia",        contactName: "Youssef Alami",  contactPhone: "0661300002", contactEmail: "assaidia@mail.ma", category: "SENIORS", playerCount: 20, status: "CONFIRMED" },
    { clubName: "FTR Oujda",        contactName: "Driss Mansouri", contactPhone: "0661300003", contactEmail: null,               category: "SENIORS", playerCount: 16, status: "PENDING" },
    { clubName: "Chabab Ahfir",     contactName: "Hamid Touzani",  contactPhone: "0661300004", contactEmail: null,               category: "CADETS",  playerCount: 14, status: "PENDING" },
    { clubName: "Olympic Zaïo",     contactName: "Karim Zerouali", contactPhone: "0661300005", contactEmail: "olympicz@mail.ma", category: "MINIMES", playerCount: 12, status: "PENDING" },
    { clubName: "MCO Oujda Juniors",contactName: "Said Benali",    contactPhone: "0661300006", contactEmail: null,               category: "JUNIORS", playerCount: 17, status: "REJECTED" },
  ];
  for (const r of registrations) {
    await prisma.tournamentRegistration.create({ data: { ...r, tournamentId: tournament.id } });
  }

  console.log("✓ Tournoi + 6 inscriptions créés");

  // ─── COACH ADMIN USER ─────────────────────────────────────────────────────
  const coachHash = await bcrypt.hash("coach123", 10);
  await prisma.adminUser.create({
    data: { email: "coach@wshm.ma", password: coachHash, name: "Hassan El Fassi", role: "COACH" },
  });
  console.log("✓ Compte entraîneur: coach / coach123");

  // ─── MORE USERS ────────────────────────────────────────────────────────────
  const secHash = await bcrypt.hash("secret123", 10);
  const authHash = await bcrypt.hash("blog123", 10);
  await prisma.adminUser.create({ data: { email: "secretaire@wshm.ma", password: secHash, name: "Fatima Zahra Idrissi", role: "SECRETARY" } });
  await prisma.adminUser.create({ data: { email: "auteur@wshm.ma", password: authHash, name: "Youssef El Amrani", role: "AUTHOR" } });
  console.log("✓ Comptes: secretaire / secret123 | auteur / blog123");

  // ─── CLUB SETTINGS ────────────────────────────────────────────────────────
  const settings = [
    { key: "club_name_fr",  value: "Wefak Sportive Hassanyat Madagh" },
    { key: "club_name_ar",  value: "الوفاق الرياضي الحسني لمداغ" },
    { key: "club_abbr",     value: "W.S.H.M" },
    { key: "president",     value: "Karim Bensouda" },
    { key: "secretary",     value: "Fatima Zahra Idrissi" },
    { key: "address",       value: "Terrain Municipal, Madagh, Province de Berkane" },
    { key: "phone",         value: "+212 661 290 000" },
    { key: "email",         value: "contact@wshm.ma" },
    { key: "bank_name",     value: "Banque Populaire Berkane" },
    { key: "rib",           value: "101 015 21234567890 14" },
    { key: "season",        value: "2025-2026" },
    { key: "founded_year",  value: "1956" },
    { key: "website",       value: "wshm.ma" },
  ];
  for (const s of settings) await prisma.clubSettings.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  console.log(`✓ ${settings.length} paramètres club configurés`);

  // ─── EXPENSES ─────────────────────────────────────────────────────────────
  const expenses = [
    { category: "TRANSPORT",     amount: 1200, expenseDate: d(2026, 5, 18), description: "Transport déplacement RSB Berkane", vendor: "Trans Berkane SARL", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "ALIMENTATION",  amount: 650,  expenseDate: d(2026, 5, 18), description: "Repas équipe après match Berkane", vendor: "Café Atlas Madagh", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "ARBITRAGE",     amount: 400,  expenseDate: d(2026, 5, 18), description: "Honoraires arbitres match J22", vendor: "FRMF — District", paidBy: "Fatima Zahra Idrissi", season: "2025-2026", notes: null },
    { category: "TRANSPORT",     amount: 900,  expenseDate: d(2026, 5, 10), description: "Déplacement match aller J21 Oujda", vendor: "Trans Oujda", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "SALAIRES",      amount: 3000, expenseDate: d(2026, 5, 1),  description: "Salaire coach Hassan El Fassi — Mai 2026", vendor: null, paidBy: "Karim Bensouda", season: "2025-2026", notes: "Virement bancaire" },
    { category: "SALAIRES",      amount: 2000, expenseDate: d(2026, 5, 1),  description: "Salaire coach Mourad Benchekroun — Mai 2026", vendor: null, paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "SALAIRES",      amount: 1500, expenseDate: d(2026, 5, 1),  description: "Salaire coach Driss Alaoui — Mai 2026", vendor: null, paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "SALAIRES",      amount: 1200, expenseDate: d(2026, 5, 1),  description: "Salaire coach Khalid Amrani — Mai 2026", vendor: null, paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "EQUIPEMENT",    amount: 4800, expenseDate: d(2026, 4, 15), description: "Maillots + équipements seniors saison 2025-2026", vendor: "Sports Store Oujda", paidBy: "Karim Bensouda", season: "2025-2026", notes: "20 maillots × 240 MAD" },
    { category: "ADMINISTRATION",amount: 350,  expenseDate: d(2026, 4, 10), description: "Frais administratifs FRMF — Licences", vendor: "FRMF", paidBy: "Fatima Zahra Idrissi", season: "2025-2026", notes: null },
    { category: "DEPLACEMENT",   amount: 1100, expenseDate: d(2026, 4, 5),  description: "Déplacement coupe — Fès aller-retour", vendor: "Bus Al Fath", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "ALIMENTATION",  amount: 480,  expenseDate: d(2026, 3, 15), description: "Iftar équipe — Ramadan 2026", vendor: "Restaurant Al Baraka", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "TRANSPORT",     amount: 750,  expenseDate: d(2026, 3, 8),  description: "Transport déplacement coupe Berkane", vendor: "Trans Berkane SARL", paidBy: "Karim Bensouda", season: "2025-2026", notes: null },
    { category: "AUTRE",         amount: 200,  expenseDate: d(2026, 3, 1),  description: "Produits médicaux boîte premiers secours", vendor: "Pharmacie Hassani", paidBy: "Fatima Zahra Idrissi", season: "2025-2026", notes: null },
  ];
  for (const e of expenses) await prisma.expense.create({ data: e });
  console.log(`✓ ${expenses.length} dépenses créées`);

  // ─── SPONSORS ─────────────────────────────────────────────────────────────
  const sponsors = [
    { name: "Banque Populaire Berkane", amount: 15000, startDate: d(2025, 9, 1), endDate: d(2026, 8, 31), tier: "OR",     logoUrl: null, isActive: true, notes: "Sponsor principal maillots 2025-2026" },
    { name: "Café Azul Madagh",         amount: 5000,  startDate: d(2025, 9, 1), endDate: d(2026, 6, 30), tier: "ARGENT", logoUrl: null, isActive: true, notes: "Sponsor boissons matchs à domicile" },
    { name: "Pharmacie Hassani",        amount: 3000,  startDate: d(2025, 9, 1), endDate: d(2026, 8, 31), tier: "BRONZE", logoUrl: null, isActive: true, notes: "Kit médical équipes" },
    { name: "Auto-École Madagh",        amount: 2500,  startDate: d(2024, 9, 1), endDate: d(2025, 8, 31), tier: "BRONZE", logoUrl: null, isActive: false, notes: "Sponsor transport saison 2024-2025" },
  ];
  for (const s of sponsors) await prisma.sponsor.create({ data: s });
  console.log(`✓ ${sponsors.length} sponsors créés`);

  // ─── PLAYER STATS ─────────────────────────────────────────────────────────
  const hamzaP = createdPlayers.find((p) => p.fullName === "Hamza Ouali")!;
  const rachidP = createdPlayers.find((p) => p.fullName === "Rachid Benali")!;
  const aminP  = createdPlayers.find((p) => p.fullName === "Amine Chakir")!;
  const mouadP = createdPlayers.find((p) => p.fullName === "Mouad El Khamlichi")!;
  const mehdiP = createdPlayers.find((p) => p.fullName === "Mehdi Zouheir")!;

  // Aggregate stats per player per season (not per match for simplicity in seed)
  const statsData = [
    { playerId: hamzaP.id, season: "2025-2026", goals: 18, assists: 5, yellowCards: 2, redCards: 0, minutesPlayed: 1980 },
    { playerId: hamzaP.id, season: "2024-2025", goals: 14, assists: 3, yellowCards: 3, redCards: 0, minutesPlayed: 1710 },
    { playerId: rachidP.id, season: "2025-2026", goals: 6, assists: 11, yellowCards: 4, redCards: 1, minutesPlayed: 1800 },
    { playerId: rachidP.id, season: "2024-2025", goals: 4, assists: 8, yellowCards: 5, redCards: 0, minutesPlayed: 1620 },
    { playerId: aminP.id, season: "2025-2026", goals: 2, assists: 7, yellowCards: 6, redCards: 0, minutesPlayed: 1980 },
    { playerId: aminP.id, season: "2024-2025", goals: 3, assists: 9, yellowCards: 4, redCards: 0, minutesPlayed: 1800 },
    { playerId: mouadP.id, season: "2025-2026", goals: 9, assists: 8, yellowCards: 3, redCards: 0, minutesPlayed: 1620 },
    { playerId: mehdiP.id, season: "2025-2026", goals: 7, assists: 4, yellowCards: 2, redCards: 0, minutesPlayed: 1440 },
  ];
  for (const s of statsData) await prisma.playerStat.create({ data: s });
  console.log(`✓ ${statsData.length} statistiques joueurs créées`);

  // ─── ATTENDANCE ────────────────────────────────────────────────────────────
  const seniorPlayers = createdPlayers.filter((p) => p.category === "SENIORS");
  const trainingDates = [
    d(2026, 5, 12), d(2026, 5, 15), d(2026, 5, 19), d(2026, 5, 22),
  ];
  for (const date of trainingDates) {
    const session = await prisma.attendance.create({
      data: { sessionDate: date, sessionType: "ENTRAINEMENT", category: "SENIORS", notes: "Entraînement régulier" },
    });
    for (const player of seniorPlayers) {
      const present = Math.random() > 0.2;
      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          playerId: player.id,
          present,
          justification: !present && Math.random() > 0.5 ? "Absence justifiée" : null,
        },
      });
    }
  }
  console.log(`✓ ${trainingDates.length} sessions de présences créées`);

  // ─── AUDIT LOG ────────────────────────────────────────────────────────────
  const auditEntries = [
    { action: "CREATE", entity: "Player",  entityId: hamzaP.id,  details: "Joueur créé", userName: "Karim Bensouda" },
    { action: "UPDATE", entity: "Player",  entityId: aminP.id,   details: "Poste modifié: Milieu central → Milieu défensif", userName: "Karim Bensouda" },
    { action: "CREATE", entity: "Payment", entityId: hamzaP.id,  details: "Paiement COTISATION 420 MAD — Saison 2025-2026", userName: "Karim Bensouda" },
    { action: "DELETE", entity: "Payment", entityId: null,        details: "Paiement supprimé (doublon)", userName: "Karim Bensouda" },
    { action: "CREATE", entity: "Match",   entityId: null,        details: "W.S.H.M 3-1 FUS Oujda — J22", userName: "Karim Bensouda" },
    { action: "UPDATE", entity: "Coach",   entityId: null,        details: "Licence mise à jour: UEFA B", userName: "Karim Bensouda" },
  ];
  for (const e of auditEntries) {
    await prisma.auditLog.create({
      data: { ...e, createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) },
    });
  }
  console.log(`✓ ${auditEntries.length} entrées d'audit créées`);

  console.log("\n✅ Base de données initialisée avec succès !");
  console.log(`   Joueurs: ${createdPlayers.length} | Paiements: ${payments.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
