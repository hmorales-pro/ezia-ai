#!/usr/bin/env python3
"""
Script de génération du PDF "5 Prompts IA pour Entrepreneurs Pressés"
Avec branding Ezia
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
import os

# Couleurs Ezia
EZIA_PURPLE = colors.HexColor('#6D3FC8')
EZIA_ORANGE = colors.HexColor('#FF6B35')
EZIA_LIGHT_PURPLE = colors.HexColor('#E8DFF5')
EZIA_DARK_GRAY = colors.HexColor('#2C3E50')
EZIA_LIGHT_GRAY = colors.HexColor('#ECF0F1')

def add_page_number(canvas, doc):
    """Ajoute les numéros de page et footer"""
    canvas.saveState()
    page_num = canvas.getPageNumber()

    # Footer avec branding
    footer_text = "© 2025 Ezia.ai - Votre copilote IA pour entrepreneurs pressés"
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.gray)
    canvas.drawCentredString(A4[0] / 2, 1.5 * cm, footer_text)

    # Numéro de page
    text = f"Page {page_num}"
    canvas.setFont('Helvetica', 9)
    canvas.drawRightString(A4[0] - 2 * cm, 1.5 * cm, text)

    canvas.restoreState()

def create_styles():
    """Crée les styles personnalisés Ezia"""
    styles = getSampleStyleSheet()

    # Titre principal
    styles.add(ParagraphStyle(
        name='EziaTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=EZIA_PURPLE,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))

    # Sous-titre
    styles.add(ParagraphStyle(
        name='EziaSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=EZIA_DARK_GRAY,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    ))

    # Titre section
    styles.add(ParagraphStyle(
        name='EziaSectionTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=EZIA_PURPLE,
        spaceAfter=15,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    ))

    # Sous-section
    styles.add(ParagraphStyle(
        name='EziaSubsection',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=EZIA_PURPLE,
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold'
    ))

    # Corps de texte
    styles.add(ParagraphStyle(
        name='EziaBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=EZIA_DARK_GRAY,
        spaceAfter=12,
        alignment=TA_JUSTIFY,
        fontName='Helvetica'
    ))

    # Code/Prompt
    styles.add(ParagraphStyle(
        name='EziaCode',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#2C3E50'),
        backColor=EZIA_LIGHT_GRAY,
        leftIndent=20,
        rightIndent=20,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Courier'
    ))

    # Highlight/Box
    styles.add(ParagraphStyle(
        name='EziaHighlight',
        parent=styles['Normal'],
        fontSize=11,
        textColor=EZIA_DARK_GRAY,
        backColor=EZIA_LIGHT_PURPLE,
        leftIndent=15,
        rightIndent=15,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica'
    ))

    return styles

def create_pdf():
    """Génère le PDF complet"""
    output_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'guides', '5-prompts-ia-entrepreneurs-presses.pdf')

    # Créer le document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=3*cm,
        bottomMargin=3*cm
    )

    # Conteneur pour les éléments
    story = []
    styles = create_styles()

    # PAGE 1 : COUVERTURE
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("5 Prompts IA", styles['EziaTitle']))
    story.append(Paragraph("pour Entrepreneurs Pressés", styles['EziaTitle']))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Gagnez 10h par semaine en automatisant<br/>vos tâches répétitives", styles['EziaSubtitle']))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("🎁 <b>Guide exclusif offert aux participants du webinaire Ezia.ai</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PAGE 2 : INTRODUCTION
    story.append(Paragraph("📖 Comment utiliser ce guide ?", styles['EziaSectionTitle']))
    story.append(Paragraph(
        "Chaque prompt est <b>prêt à l'emploi</b>. Copiez-collez le dans ChatGPT, Claude ou votre IA préférée, "
        "remplacez les parties entre [crochets] par vos informations, et laissez l'IA travailler pour vous.",
        styles['EziaBody']
    ))
    story.append(Paragraph(
        "<b>💡 Astuce</b> : Enregistrez ces prompts dans vos favoris ou créez un document de référence "
        "pour y accéder rapidement.",
        styles['EziaHighlight']
    ))
    story.append(PageBreak())

    # PROMPT 1
    story.append(Paragraph("🚀 Prompt 1 : Rédaction d'emails professionnels en 30 secondes", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>Cas d'usage</b> : Réponses clients, emails de prospection, relances, négociations", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Le Prompt :</b>", styles['EziaSubsection']))
    prompt1 = """Je dois envoyer un email professionnel avec le contexte suivant :

Destinataire : [Ex: un prospect intéressé par mes services]
Objectif : [Ex: le convaincre de réserver un appel découverte]
Ton souhaité : [Ex: professionnel mais chaleureux]
Éléments clés à inclure : [Ex: notre expertise depuis 5 ans, témoignage client, disponibilités cette semaine]

Rédige un email de 150-200 mots maximum, avec :
- Un objet accrocheur
- Une introduction personnalisée
- Un call-to-action clair
- Une signature professionnelle

Propose 2 versions : une plus formelle et une plus décontractée."""

    story.append(Paragraph(prompt1.replace('\n', '<br/>'), styles['EziaCode']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>📈 Gain de temps</b> : 15-20 minutes par email → <b>5h économisées par mois</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PROMPT 2
    story.append(Paragraph("📱 Prompt 2 : Création de posts LinkedIn/réseaux sociaux", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>Cas d'usage</b> : Visibilité, personal branding, engagement communauté", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Le Prompt :</b>", styles['EziaSubsection']))
    prompt2 = """Crée un post LinkedIn engageant sur le sujet suivant :

Thème : [Ex: mon retour d'expérience sur l'automatisation de mon business]
Message principal : [Ex: j'ai gagné 15h/semaine en automatisant 3 tâches clés]
Public cible : [Ex: entrepreneurs solo et TPE]
Ton : [Ex: inspirant mais humble, storytelling]

Structure souhaitée :
1. Accroche forte (première ligne)
2. Contexte ou problème (2-3 lignes)
3. Solution ou action prise (développement)
4. Résultat concret avec chiffres
5. Question ou call-to-action pour engager

Longueur : 150-200 mots maximum
Ajoute 3-5 emojis pertinents mais sans en abuser
Propose 3 hashtags stratégiques"""

    story.append(Paragraph(prompt2.replace('\n', '<br/>'), styles['EziaCode']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>📈 Gain de temps</b> : 30-45 minutes par post → <b>3h économisées par mois</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PROMPT 3
    story.append(Paragraph("📝 Prompt 3 : Résumé de réunions et compte-rendus", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>Cas d'usage</b> : Transformer vos notes de réunion en actions concrètes", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Le Prompt :</b>", styles['EziaSubsection']))
    prompt3 = """Voici mes notes brutes d'une réunion :

[Collez vos notes ici, même désorganisées]

Transforme ces notes en compte-rendu structuré avec :

1. **Contexte** (1 phrase) : De quoi parlait cette réunion ?
2. **Participants** : Liste des personnes présentes
3. **Décisions prises** : Points validés (bullet points)
4. **Actions à réaliser** : Format tableau avec 4 colonnes :
   - Action
   - Responsable
   - Deadline
   - Priorité (Haute/Moyenne/Basse)
5. **Points en suspens** : Questions restées sans réponse
6. **Date prochaine réunion** (si mentionnée)

Ton : professionnel et synthétique
Format : prêt à être envoyé par email ou partagé sur Notion"""

    story.append(Paragraph(prompt3.replace('\n', '<br/>'), styles['EziaCode']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>📈 Gain de temps</b> : 20-30 minutes par réunion → <b>4h économisées par mois</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PROMPT 4
    story.append(Paragraph("🔍 Prompt 4 : Analyse de marché express", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>Cas d'usage</b> : Étudier la concurrence, identifier des tendances, valider une idée", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Le Prompt :</b>", styles['EziaSubsection']))
    prompt4 = """Je veux analyser le marché suivant :

Secteur : [Ex: coaching business pour entrepreneurs]
Zone géographique : [Ex: France]
Mon positionnement : [Ex: coaching + outils IA pour automatiser]

Fournis-moi une analyse structurée avec :

1. **Taille du marché** : Chiffres clés et tendances 2024-2025
2. **Concurrents principaux** : 5 acteurs majeurs avec leur positionnement
3. **Opportunités identifiées** : 3 angles d'attaque peu exploités
4. **Menaces potentielles** : Risques à anticiper
5. **Tendances émergentes** : Ce qui va exploser en 2025
6. **Pricing moyen** : Fourchettes de prix pratiquées
7. **Recommandations** : 3 actions prioritaires pour se différencier

Format : synthétique mais précis, avec sources si possible
Ton : analytique et orienté action"""

    story.append(Paragraph(prompt4.replace('\n', '<br/>'), styles['EziaCode']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>📈 Gain de temps</b> : 2-3h de recherche manuelle → <b>8h économisées par analyse</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PROMPT 5
    story.append(Paragraph("📅 Prompt 5 : Planification de semaine optimisée", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>Cas d'usage</b> : Prioriser, organiser, ne plus se sentir débordé", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Le Prompt :</b>", styles['EziaSubsection']))
    prompt5 = """Voici toutes mes tâches et objectifs pour la semaine :

[Listez tout en vrac : tâches urgentes, projets en cours, deadlines, réunions prévues]

Aide-moi à organiser ma semaine de manière optimale :

1. **Priorisation** : Classe ces tâches selon la matrice Eisenhower
   - Urgent + Important
   - Important mais pas urgent
   - Urgent mais pas important
   - Ni urgent ni important (à déléguer ou supprimer)

2. **Planning jour par jour** : Répartis les tâches sur 5 jours avec :
   - Maximum 3 tâches prioritaires par jour
   - Temps estimé pour chaque tâche
   - Blocs de temps dédiés (Deep Work le matin, Admin l'après-midi)

3. **Recommandations** :
   - Quelles tâches déléguer ou automatiser ?
   - Quelles tâches peuvent attendre la semaine prochaine ?
   - Où bloquer du temps pour l'imprévu ?

Format : tableau clair et actionnable
Ton : coach bienveillant mais exigeant"""

    story.append(Paragraph(prompt5.replace('\n', '<br/>'), styles['EziaCode']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>📈 Gain de temps</b> : 1-2h de planification brouillon → <b>5h économisées par semaine</b>", styles['EziaHighlight']))
    story.append(PageBreak())

    # PAGE BONUS
    story.append(Paragraph("🎁 BONUS : Comment personnaliser ces prompts ?", styles['EziaSectionTitle']))
    story.append(Paragraph("<b>3 astuces pour des résultats encore meilleurs :</b>", styles['EziaBody']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph(
        "<b>1. Soyez hyper-précis</b> : Plus vous donnez de contexte, meilleur sera le résultat<br/>"
        "❌ \"Rédige un email\"<br/>"
        "✅ \"Rédige un email de relance pour un prospect qui a téléchargé mon lead magnet il y a 3 jours mais n'a pas répondu\"",
        styles['EziaBody']
    ))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph(
        "<b>2. Ajoutez des exemples</b> : Montrez à l'IA ce que vous aimez<br/>"
        "\"Voici un email que j'aime : [exemple]. Inspire-toi de ce ton.\"",
        styles['EziaBody']
    ))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph(
        "<b>3. Itérez</b> : Si le premier résultat n'est pas parfait, demandez des ajustements<br/>"
        "\"Rends cette version plus chaleureuse\"<br/>"
        "\"Ajoute des chiffres concrets\"<br/>"
        "\"Raccourcis à 100 mots maximum\"",
        styles['EziaBody']
    ))
    story.append(Spacer(1, 1*cm))

    # CTA FINAL
    story.append(Paragraph("🚀 Prêt à aller plus loin ?", styles['EziaSectionTitle']))
    story.append(Paragraph(
        "Ces 5 prompts peuvent vous faire <b>gagner 10h par semaine</b>.",
        styles['EziaBody']
    ))
    story.append(Paragraph(
        "Mais imaginez si vous aviez un <b>copilote IA qui connaît votre business par cœur</b> "
        "et automatise ces tâches pour vous, sans même avoir à copier-coller des prompts...",
        styles['EziaBody']
    ))
    story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph("<b>C'est exactement ce que fait Ezia.</b> 🤖", styles['EziaHighlight']))
    story.append(Spacer(1, 0.3*cm))

    benefits = [
        "✅ Analyse votre marché automatiquement",
        "✅ Génère votre contenu marketing",
        "✅ Planifie votre stratégie semaine par semaine",
        "✅ Crée votre site web et vos landing pages",
        "✅ Suit vos concurrents et détecte les opportunités"
    ]

    for benefit in benefits:
        story.append(Paragraph(benefit, styles['EziaBody']))

    story.append(Spacer(1, 1*cm))

    # OFFRE
    story.append(Paragraph("🎯 Offre exclusive participants webinaire", styles['EziaSubsection']))
    story.append(Paragraph(
        "<b>Code promo : EARLYBIRD30</b><br/>"
        "<b>-30% sur votre abonnement Ezia</b><br/>"
        "<b>Valable 3 mois après le webinaire</b>",
        styles['EziaHighlight']
    ))
    story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph(
        "👉 <b>Rejoignez la waiting list VIP</b> : ezia.ai/waiting-list",
        styles['EziaBody']
    ))
    story.append(Paragraph("Accès prioritaire au lancement + support dédié.", styles['EziaBody']))
    story.append(Spacer(1, 1*cm))

    story.append(Paragraph("<b>Questions ?</b> Contactez-nous : hello@ezia.ai", styles['EziaBody']))

    # Construire le PDF
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)

    print(f"✅ PDF généré avec succès : {output_path}")
    return output_path

if __name__ == "__main__":
    create_pdf()
