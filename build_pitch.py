import os
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#64748b'))
        if self._pageNumber > 1:
            self.drawString(36, letter[1] - 28, 'BEYONDPROOF — 2-Minute Judge Pitch & Execution Guide')
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.5)
            self.line(36, letter[1] - 32, letter[0] - 36, letter[1] - 32)
        footer_text = f'Page {self._pageNumber} of {page_count}'
        self.drawRightString(letter[0] - 36, 22, footer_text)
        self.drawString(36, 22, 'CONFIDENTIAL — TEAM BBC (BEYONDPROOF)')
        self.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.setLineWidth(0.5)
        self.line(36, 32, letter[0] - 36, 32)
        self.restoreState()

def generate():
    out_file = os.path.abspath('BEYONDPROOF_2_Minute_Judge_Pitch.pdf')
    doc = SimpleDocTemplate(out_file, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=38, bottomMargin=38)
    styles = getSampleStyleSheet()

    t_style = ParagraphStyle('TStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#0f172a'))
    sub_style = ParagraphStyle('SubStyle', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#475569'))
    h2_style = ParagraphStyle('H2Style', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=colors.HexColor('#1e1b4b'), spaceBefore=7, spaceAfter=4)
    time_style = ParagraphStyle('TimeStyle', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.HexColor('#4338ca'))
    bold_style = ParagraphStyle('BStyle', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.HexColor('#0f172a'))
    quote_style = ParagraphStyle('QStyle', fontName='Helvetica-Oblique', fontSize=7.5, leading=10.5, textColor=colors.HexColor('#1e1b4b'))
    act_style = ParagraphStyle('ActStyle', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.HexColor('#047857'))
    th_style = ParagraphStyle('THStyle', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.white)
    b_dark = ParagraphStyle('BDark', fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor('#1e293b'))

    story = []

    # Banner
    banner = [
        [Paragraph('<b>BEYONDPROOF</b> | 2-Minute Executive Pitch Script &amp; Demo Guide', t_style)],
        [Paragraph('Universal Digital Trust &amp; Forensic Verification Platform &bull; Hackathon Judge Presentation Deck', sub_style)]
    ]
    t_banner = Table(banner, colWidths=[letter[0]-72])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 6))

    # Section 1: Pitch Timeline
    story.append(Paragraph('1. The 120-Second Pitch Timeline (Word-for-Word Script)', h2_style))
    
    t_data = [
        [Paragraph('<b>Time</b>', th_style), Paragraph('<b>Phase &amp; Focus</b>', th_style), Paragraph('<b>Spoken Script (What to Say)</b>', th_style), Paragraph('<b>Demo Action (What to Click)</b>', th_style)],
        [
            Paragraph('0:00 - 0:25<br/>(25 sec)', time_style),
            Paragraph('<b>The Hook &amp; Problem</b><br/><font color="#b91c1c">AI Fraud Epidemic</font>', bold_style),
            Paragraph('&ldquo;Judges, in 2026, generative AI can forge a passport in 3 seconds, alter legal contract terms in one click, and clone audio seamlessly. Today&#39;s detection tools are unreliable black-boxes that spit out random percentage guesses with zero legal evidence. Enterprises cannot act on guesses. They need mathematical proof.&rdquo;', quote_style),
            Paragraph('Start on <b>Dashboard</b> (<code>/dashboard</code>). Show live platform stats and multi-vector threat landscape.', act_style),
        ],
        [
            Paragraph('0:25 - 0:50<br/>(25 sec)', time_style),
            Paragraph('<b>The Solution</b><br/><font color="#4338ca">BEYONDPROOF Core</font>', bold_style),
            Paragraph('&ldquo;That is why we built <b>BEYONDPROOF</b>. Instead of guessing, BEYONDPROOF executes <b>7 local, deterministic forensic microservices</b>. We inspect raw font glyph streams in PDFs, compute Error Level Analysis on image pixels, validate international ICAO passport checksums, and trace cryptographic provenance. 100% locally&mdash;zero cloud API costs, zero customer data leakage.&rdquo;', quote_style),
            Paragraph('Point to the <b>7 Active Microservices</b> badge. Emphasize self-contained local execution.', act_style),
        ],
        [
            Paragraph('0:50 - 1:30<br/>(40 sec)', time_style),
            Paragraph('<b>Live Demo &amp; Proof</b><br/><font color="#047857">Inspection &amp; Graph</font>', bold_style),
            Paragraph('&ldquo;Watch it in action: On our <b>Document &amp; Identity Engines</b>, we extract portrait biometrics and mathematically compute the ICAO 7-3-1 modulo-10 checksum to catch fake passports instantly. On <b>Source Tracker</b>, we compare suspect files against baselines using perceptual pHash hamming distances. And fraud is never isolated: our <b>Trust Graph</b> uses NetworkX to dynamically map files, user custody, and threat nodes in an interactive relational graph.&rdquo;', quote_style),
            Paragraph('1. Click <b>Verification Result</b> (show circular Risk Gauge).<br/>2. Open <b>Trust Graph</b> (highlight connected nodes).<br/>3. Click <b>Download Forensic Dossier</b>.', act_style),
        ],
        [
            Paragraph('1:30 - 1:50<br/>(20 sec)', time_style),
            Paragraph('<b>Market &amp; ROI</b><br/><font color="#b45309">Enterprise Value</font>', bold_style),
            Paragraph('&ldquo;Every verification synthesizes into an explainable Bayesian risk score. This unlocks three massive enterprise verticals: <b>Fintech &amp; Banking</b> for automated KYC fraud prevention, <b>Insurance</b> for tamper-evident claim photo analysis, and <b>Legal/Compliance</b> audits. We turn hours of manual forensic analysis into 4 seconds.&rdquo;', quote_style),
            Paragraph('Show the dynamic <b>Recommended Actions</b> card (Certified for Ingestion vs Quarantine).', act_style),
        ],
        [
            Paragraph('1:50 - 2:00<br/>(10 sec)', time_style),
            Paragraph('<b>Closing Hook</b><br/><font color="#4338ca">The Punchline</font>', bold_style),
            Paragraph('&ldquo;Don&#39;t trust an AI score. <b>Prove it with BEYONDPROOF</b>. Thank you, and we welcome your questions!&rdquo;', quote_style),
            Paragraph('End on the <b>Forensic PDF Report</b> cover or Dashboard overview.', act_style),
        ]
    ]
    t_timeline = Table(t_data, colWidths=[58, 96, 246, 140])
    t_timeline.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e1b4b')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_timeline)
    story.append(Spacer(1, 8))

    # Section 2: Demo sequence
    story.append(Paragraph('2. Live Demo Click Sequence (120-Second Screen Execution)', h2_style))
    d_data = [
        [Paragraph('<b>Step</b>', th_style), Paragraph('<b>URL Route</b>', th_style), Paragraph('<b>On-Screen Visual Highlight &amp; Talk Track</b>', th_style), Paragraph('<b>Time</b>', th_style)],
        [Paragraph('<b>1</b>', bold_style), Paragraph('<code>/dashboard</code>', b_dark), Paragraph('Overview of 7 active engines, platform health, and multi-vector verification stats.', b_dark), Paragraph('15s', bold_style)],
        [Paragraph('<b>2</b>', bold_style), Paragraph('<code>/verification/&lt;id&gt;</code>', b_dark), Paragraph('Show circular <b>Risk Gauge</b>, individual engine findings, and raw byte/pixel proof.', b_dark), Paragraph('35s', bold_style)],
        [Paragraph('<b>3</b>', bold_style), Paragraph('<code>/trust-graph</code>', b_dark), Paragraph('Drag and inspect the interactive relational graph connecting files, user custody, and threat nodes.', b_dark), Paragraph('30s', bold_style)],
        [Paragraph('<b>4</b>', bold_style), Paragraph('<code>Download Report</code>', b_dark), Paragraph('Click <b>Download Forensic Dossier</b> to open the tamper-evident, court-ready PDF.', b_dark), Paragraph('25s', bold_style)],
        [Paragraph('<b>5</b>', bold_style), Paragraph('<code>/risk</code> or <code>/source</code>', b_dark), Paragraph('Show explainable Bayesian weight distribution and dual-file perceptual pHash diffing.', b_dark), Paragraph('15s', bold_style)],
    ]
    t_demo = Table(d_data, colWidths=[32, 108, 340, 60])
    t_demo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f0fdfa')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_demo)

    story.append(PageBreak())

    # Page 2: Competitive Advantage & Q&A
    story.append(Paragraph('3. Key Competitive Differentiators (Why BEYONDPROOF Wins)', h2_style))
    c_data = [
        [Paragraph('<b>Dimension</b>', th_style), Paragraph('<b>Conventional AI Detectors (Hive, Copyleaks)</b>', th_style), Paragraph('<b>BEYONDPROOF Platform</b>', th_style)],
        [Paragraph('<b>Forensic Method</b>', bold_style), Paragraph('Black-box neural network probability (hallucination-prone).', b_dark), Paragraph('<b>Deterministic, multi-layered signal forensics</b> (PyMuPDF, OpenCV, ELA, pHash).', b_dark)],
        [Paragraph('<b>Evidence Level</b>', bold_style), Paragraph('Vague percentage score (e.g., &ldquo;82% likely AI&rdquo;).', b_dark), Paragraph('<b>Specific finding codes</b> with raw byte offsets, checksums, and pixel deltas.', b_dark)],
        [Paragraph('<b>Data Privacy</b>', bold_style), Paragraph('Uploads sensitive passports &amp; contracts to 3rd-party clouds.', b_dark), Paragraph('<b>100% self-contained local execution</b> (air-gapped &amp; enterprise ready).', b_dark)],
        [Paragraph('<b>Coverage</b>', bold_style), Paragraph('Single-purpose: only images OR only text.', b_dark), Paragraph('<b>Unified: PDF Documents, Images, Video, Audio, &amp; Passports/IDs</b>.', b_dark)],
        [Paragraph('<b>Legal Output</b>', bold_style), Paragraph('None (inadmissible in legal or compliance disputes).', b_dark), Paragraph('<b>Tamper-evident, signed PDF Dossier</b> with SHA-256 custody anchors.', b_dark)],
    ]
    t_comp = Table(c_data, colWidths=[105, 205, 230])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#312e81')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 8))

    # Section 4: Q&A
    story.append(Paragraph('4. Rapid-Fire Judge Q&amp;A Defense Cheat Sheet', h2_style))
    qa_items = [
        ('Q1: "Why not just use an LLM or deep vision model to detect fakes?"', 'A: "LLMs hallucinate and cannot provide legal chain-of-custody. In court, saying \'an AI thinks this is fake\' is inadmissible. BEYONDPROOF relies on deterministic signal analysis—byte streams, font dictionaries, and ICAO mathematical checksums. We provide mathematical proof, not opinions."'),
        ('Q2: "What if an attacker strips metadata from an image or PDF?"', 'A: "Stripping metadata triggers immediate provenance anomaly flags. Moreover, physical signal properties cannot be hidden: Error Level Analysis detects JPEG recompression deltas, font stream parsers detect un-embedded glyphs, and MRZ checksums cannot be spoofed without valid personal data."'),
        ('Q3: "How does this scale to millions of enterprise transactions?"', 'A: "Every engine is an independent microservice orchestrated asynchronously via FastAPI and WebSockets. In production, each engine scales horizontally on Kubernetes pods, processing thousands of files per minute with sub-second single-engine latency."'),
        ('Q4: "Who are your target paying customers?"', 'A: "Three enterprise verticals: (1) Fintech banks pay per KYC verification to eliminate fake identity onboarding, (2) Insurance firms license on-premise for fraud-free claims processing, and (3) Law firms pay for verifiable forensic evidence dossiers."'),
    ]

    qa_rows = []
    for q, a in qa_items:
        qa_rows.append([Paragraph(f'<b>{html.escape(q)}</b>', ParagraphStyle('Q', fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=colors.HexColor('#0f172a')))])
        qa_rows.append([Paragraph(html.escape(a), ParagraphStyle('A', fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor('#334155')))])

    t_qa = Table(qa_rows, colWidths=[letter[0]-72])
    t_qa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_qa)
    story.append(Spacer(1, 8))

    closing = [[
        Paragraph('<b>PRO TIP FOR THE STAGE:</b> Deliver the 3 visual highlights: (1) Risk Gauge, (2) Interactive Trust Graph, and (3) Downloaded PDF Dossier. Hand the judges the PDF or point to the screen when delivering your final punchline: <i>&ldquo;Don&#39;t trust an AI score. Prove it with BEYONDPROOF.&rdquo;</i>', ParagraphStyle('Tip', fontName='Helvetica', fontSize=8, leading=11, textColor=colors.HexColor('#4338ca')))
    ]]
    t_close = Table(closing, colWidths=[letter[0]-72])
    t_close.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eef2ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a5b4fc')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_close)

    doc.build(story, canvasmaker=NumberedCanvas)
    print('PDF built successfully: ' + out_file)

if __name__ == '__main__':
    generate()
