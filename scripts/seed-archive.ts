import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const DOCS = [
  // ── REUNION (8) ──────────────────────────────────────────────────────────
  { title: "PV AG Ordinaire — Mars 2026",              category: "REUNION",        year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Assemblée générale ordinaire annuelle. Election du bureau, rapport moral et financier." },
  { title: "PV Bureau Directeur — Janvier 2026",       category: "REUNION",        year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Réunion du bureau : préparation saison, recrutements, planning matchs." },
  { title: "PV Réunion Technique — Décembre 2025",     category: "REUNION",        year: 2025, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Bilan mi-saison. Performances sportives, état des licences, finances." },
  { title: "PV AG Extraordinaire — Octobre 2025",      category: "REUNION",        year: 2025, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "AG extraordinaire pour modification des statuts et renouvellement partiel du bureau." },
  { title: "PV Commission Sportive — Juillet 2025",    category: "REUNION",        year: 2025, fileType: "pdf",  uploadedBy: "Directeur Sportif",  description: "Sélection des effectifs pour la saison 2025-2026. Évaluation des joueurs." },
  { title: "PV AG Ordinaire — Mars 2025",              category: "REUNION",        year: 2025, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "AG annuelle 2025. Quitus financier, renouvellement du tiers sortant." },
  { title: "PV Réunion Disciplinaire — Novembre 2024", category: "REUNION",        year: 2024, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Commission de discipline interne : sanctions suite incidents match." },
  { title: "PV AG Ordinaire — Mars 2024",              category: "REUNION",        year: 2024, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "AG ordinaire 2024. Rapport annuel, budget, projets de la saison suivante." },

  // ── JURIDIQUE (5) ─────────────────────────────────────────────────────────
  { title: "Récépissé de Déclaration WSHM",            category: "JURIDIQUE",      year: 2022, fileType: "pdf",  uploadedBy: "Président",          description: "Récépissé officiel de déclaration de l'association délivré par le Gouverneur de Berkane." },
  { title: "Arrêté d'Agrément Sportif",                category: "JURIDIQUE",      year: 2023, fileType: "pdf",  uploadedBy: "Président",          description: "Arrêté d'agrément délivré par la Direction Régionale de la Jeunesse et des Sports." },
  { title: "Règlement Intérieur 2025",                 category: "JURIDIQUE",      year: 2025, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Règlement intérieur mis à jour et adopté en AG ordinaire de mars 2025." },
  { title: "Charte d'Éthique et Fair-Play",            category: "JURIDIQUE",      year: 2024, fileType: "pdf",  uploadedBy: "Président",          description: "Charte signée par tous les membres, joueurs et encadrants. Fair-play et valeurs du sport." },
  { title: "Attestation d'Affiliation FRMF",           category: "JURIDIQUE",      year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Attestation d'affiliation à la Fédération Royale Marocaine de Football — saison 2025-2026." },

  // ── STATUTS (4) ───────────────────────────────────────────────────────────
  { title: "Statuts WSHM — Version 2025",              category: "STATUTS",        year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Statuts en vigueur de l'association, révisés et approuvés en AG extraordinaire oct. 2025." },
  { title: "Acte de Modification des Statuts 2022",    category: "STATUTS",        year: 2022, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Procès-verbal de modification des statuts relatif à la gouvernance et aux finances." },
  { title: "Statuts Originaux — Fondation 1956",       category: "STATUTS",        year: 1956, fileType: "pdf",  uploadedBy: "Président",          description: "Document fondateur de l'association. Statuts d'origine, version numérisée." },
  { title: "Règlement Disciplinaire Interne",          category: "STATUTS",        year: 2024, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Procédures disciplinaires, sanctions applicables aux joueurs, encadrants et membres." },

  // ── CONTRAT (5) ───────────────────────────────────────────────────────────
  { title: "Contrat Coach Principal — Saison 2025-2026",   category: "CONTRAT",   year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Contrat de prestation de services avec l'entraîneur principal. Durée : 1 an, objectifs définis." },
  { title: "Contrat Coach Juniors — Saison 2025-2026",     category: "CONTRAT",   year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Contrat coaching catégorie Juniors U18. Conditions, rémunération, obligations." },
  { title: "Convention Partenariat Arganine Berkane",       category: "CONTRAT",   year: 2026, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Convention de partenariat et sponsoring annuel avec la société Arganine. Montant : 15 000 MAD." },
  { title: "Convention Terrain Municipal — Stade Madagh",   category: "CONTRAT",   year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Convention de mise à disposition du terrain municipal de Madagh pour entraînements et matchs à domicile." },
  { title: "Contrat Prestataire Transport — Saison 2025",   category: "CONTRAT",   year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Contrat de transport des équipes pour les déplacements. Tarifs et conditions négociés." },

  // ── CORRESPONDANCE (7) ────────────────────────────────────────────────────
  { title: "Demande de Licences FRMF — Saison 2026",        category: "CORRESPONDANCE", year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Dossier complet de demande de licences joueurs et encadrants pour la saison 2025-2026." },
  { title: "Réponse Délégation Provinciale Sport",           category: "CORRESPONDANCE", year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Réponse favorable de la délégation provinciale concernant la subvention demandée." },
  { title: "Courrier Commune Berkane — Subvention Terrain",  category: "CORRESPONDANCE", year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Lettre officielle de mise à disposition du terrain communal pour la saison sportive." },
  { title: "Courrier FRMF — Participation Coupe Amateur",    category: "CORRESPONDANCE", year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Confirmation participation à la Coupe du Trône Amateur, phase régionale." },
  { title: "Correspondance Ligue Régionale Orientale",       category: "CORRESPONDANCE", year: 2025, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Échanges officiels avec la Ligue Régionale concernant le calendrier et les arbitres." },
  { title: "Demande Subvention Province Berkane 2025",        category: "CORRESPONDANCE", year: 2025, fileType: "pdf",  uploadedBy: "Président",          description: "Dossier complet de demande de subvention auprès des autorités provinciales." },
  { title: "Réponse Subvention Accordée — 2024",             category: "CORRESPONDANCE", year: 2024, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Notification officielle d'attribution de la subvention de 8 000 MAD pour 2024." },

  // ── FINANCIER (9) ─────────────────────────────────────────────────────────
  { title: "Bilan Financier Annuel 2024-2025",               category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Bilan complet recettes/dépenses saison 2024-2025. Excédent budgétaire de 3 200 MAD." },
  { title: "Budget Prévisionnel 2025-2026",                  category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Budget prévisionnel adopté en AG mars 2025. Recettes estimées : 85 000 MAD." },
  { title: "Relevé Bancaire — Octobre 2025",                 category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Relevé du compte courant associatif. Solde au 31/10/2025 : 12 400 MAD." },
  { title: "Relevé Bancaire — Janvier 2026",                 category: "FINANCIER", year: 2026, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Relevé du compte courant associatif. Solde au 31/01/2026 : 9 800 MAD." },
  { title: "Reçu Subvention Municipale 2025",                category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Reçu officiel de la subvention communale annuelle de 6 000 MAD." },
  { title: "Facture Équipements Sportifs — Juniors",         category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Facture achat maillots, shorts, chaussettes, ballons pour la catégorie Juniors." },
  { title: "Facture Transport — Tournoi Nador 2025",         category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Facture location bus pour déplacement tournoi de Nador. Montant : 2 400 MAD." },
  { title: "Attestation Fiscale 2025",                       category: "FINANCIER", year: 2025, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Attestation de régularité fiscale délivrée par la Direction des Impôts." },
  { title: "Rapport Financier AG — Mars 2026",               category: "FINANCIER", year: 2026, fileType: "pdf",  uploadedBy: "Trésorier",          description: "Rapport financier présenté à l'AG 2026. Détail recettes cotisations, sponsors, dépenses." },

  // ── AUTRE (2) ─────────────────────────────────────────────────────────────
  { title: "Certificat d'Assurance Sportive 2026",           category: "AUTRE",     year: 2026, fileType: "pdf",  uploadedBy: "Secrétaire Général", description: "Police d'assurance couvrant joueurs et encadrants pour la saison 2025-2026. RC + individuelle accident." },
  { title: "Rapport Médical Collectif — Saison 2025",        category: "AUTRE",     year: 2025, fileType: "pdf",  uploadedBy: "Directeur Sportif",  description: "Rapport du médecin de l'association. Aptitudes, contre-indications, suivi des blessures." },
];

const PLACEHOLDER_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function main() {
  console.log("🗂️  Seeding archive with 40 documents...");

  await prisma.archive.deleteMany({});
  console.log("   ✓ Cleared existing archive entries");

  for (const doc of DOCS) {
    await prisma.archive.create({
      data: {
        title: doc.title,
        category: doc.category,
        fileUrl: PLACEHOLDER_URL,
        fileType: doc.fileType,
        fileSize: Math.floor(Math.random() * 2_000_000) + 100_000,
        description: doc.description,
        year: doc.year,
        uploadedBy: doc.uploadedBy,
      },
    });
  }

  console.log(`   ✓ Created ${DOCS.length} archive documents`);
  console.log("\n📊 Summary:");
  const cats = ["REUNION","JURIDIQUE","STATUTS","CONTRAT","CORRESPONDANCE","FINANCIER","AUTRE"];
  for (const cat of cats) {
    const count = DOCS.filter((d) => d.category === cat).length;
    console.log(`   ${cat.padEnd(15)} ${count} docs`);
  }
  console.log("\n✅ Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
