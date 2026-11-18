"""Regenerate the reviewed initial SQL seed. Not used by the website at runtime."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
rows = []
journals = json.loads((root / "supabase/project-journals.json").read_text(encoding="utf-8"))
def add(table, data, order=0, published=True):
    payload = json.dumps(data, ensure_ascii=False).replace("'", "''")
    rows.append(f"insert into public.{table}(data,published,display_order) values ('{payload}'::jsonb,{str(published).lower()},{order});")

add('profile', dict(name='Rohit Kumar Yadav',headline='Computer Science student building with AI, data & the web.',introduction='I turn curiosity into practical software. Exploring AI-powered applications, data workflows, and full-stack development—one project at a time.',about='I’m a Computer Science Engineering undergraduate at Guru Gobind Singh Indraprastha University, Delhi, graduating in 2029. My interests sit at the intersection of artificial intelligence, data science, and software engineering.\nI learn by building: working through a problem, testing an approach, and improving what I make. Internships in data science and web development have given me opportunities to apply that approach to real assignments. I’m now growing my skills in full-stack applications and useful automation.',email='rohitky9910@gmail.com',linkedin='https://linkedin.com/in/rohitkumaryadav1',github='https://github.com/rohitkumaryadav1',x='https://x.com/Rohityadav1__',location='Delhi, India',focus='Mail Trace Monitor · Chrome extension + FastAPI',image='initial/rohit-yellow-hoodie.webp',resume_path='initial/rohit-resume.pdf'))

def project(title, short, description, technologies=None, status='Completed', featured=False):
    data = dict(title=title,short_description=short,description=description,technologies=technologies or [],status=status,github='',demo='',start_date='',completion_date='',featured=featured,image='',screenshots=[],blog_url='',youtube_url='',blog_content='',highlights=[],currently_building=False)
    data.update(journals.get(title, {}))
    return data

add('projects', project('AI-Powered Resume Analyzer & Optimization Platform','Resume parsing, job-description matching, and LLM-assisted suggestions for more relevant applications.','An independent AI-powered resume optimization project that analyzes resumes against job descriptions, identifies skill gaps, and suggests content improvements.\nProject test results recorded in my resume include 85% keyword matching accuracy, 70% less manual resume review effort, and a 40% improvement in ATS compatibility scores through keyword optimization and suggestions.',featured=True),0)
add('projects', project('AI-Powered Job Discovery & Outreach Automation Platform','Job aggregation, skill-based relevance scoring, and personalized recruiter outreach.','An independent platform combining job aggregation and filtering with skill-based opportunity matching and LLM-generated recruiter emails.\nResults recorded in my resume include analysis of 1,000+ job listings, 80% less manual job-search effort, and a 60% improvement in application workflow efficiency.',featured=True),1)
add('projects', project('Mail Trace Monitor','A Chrome extension exploring email-open detection and tracked-link click events.','An ongoing independent Chrome extension and Python backend for understanding email engagement.\nThe extension includes Gmail compose detection, Chrome Storage preferences, tracking-record creation, and pre-send tracking-pixel insertion. The FastAPI backend includes a transparent-pixel endpoint, redirect-based link tracking, event recording, and analytics backed by SQLAlchemy and PostgreSQL.\nDevelopment is ongoing across the extension and backend. Mail Trace Monitor is currently In Progress. Email-open signals come from tracking-pixel requests and can be affected by email privacy settings.', ['Chrome Extension','HTML','CSS','JavaScript','Python','FastAPI','Uvicorn','SQLAlchemy','PostgreSQL','REST APIs','Chrome Storage','Git','GitHub'], 'In Progress'),2)

add('experiences',dict(organization='Land Ports Authority of India (LPAI)',position='Data Science Intern',parent_organization='Ministry of Home Affairs, Government of India',location='New Delhi, India',start_date='2026-07-01',completion_date='2026-08-01',description='Worked on reproducible machine learning workflows and an interactive decision-support platform for Integrated Check Posts.',responsibilities=['Built a pipeline covering extraction, cleaning, and feature engineering for 13 years of LPAI reports.','Compared Linear Regression, Random Forest, Extra Trees, and Gradient Boosting with automated model selection and evaluation.','Built a Streamlit platform with 30+ KPIs, validation dashboards, feature importance, and future forecasting.'],achievements=['80% less manual analysis effort and an R² of 0.72.'],technologies=['Scikit-learn','Streamlit','Regression','Feature Engineering','Data Visualization']),0)
add('experiences',dict(organization='Cozmoh',position='Web Developer Intern',parent_organization='',location='Mumbai, India',start_date='2025-11-01',completion_date='2026-01-01',description='Developed responsive WordPress pages and collaborated with designers and stakeholders on client website assignments.',responsibilities=['Developed and optimized responsive pages with WordPress and Elementor.','Implemented reusable UI components and improved page layouts and visual consistency.','Translated business requirements into responsive web solutions in collaboration with designers and project stakeholders.'],achievements=['mobile compatibility across all assigned pages, 30% fewer client revision requests, and 40% better visual consistency.'],technologies=['WordPress','Elementor']),1)

categories={
'Programming Languages':['Python','C','C++','JavaScript','HTML','CSS'],
'Data Science':['Pandas','NumPy','Data Preprocessing','Feature Engineering','Data Visualization'],
'Machine Learning':['Scikit-learn','Regression','Model Training','Model Evaluation','Feature Importance'],
'AI & NLP':['LLM Integration','Prompt Engineering','Resume/JD Analysis','Skill-Gap Detection'],
'Web, Backend & APIs':['Streamlit','WordPress','FastAPI','SQLAlchemy','PostgreSQL','REST API Integration','Chrome Extensions'],
'Tools & Foundations':['Git','GitHub','Jupyter Notebook','Postman','Vercel','JSON','Object-Oriented Programming']}
index=0
for category,names in categories.items():
    for name in names:
        add('skills',dict(name=name,category=category),index)
        index+=1
add('education',dict(university='Guru Gobind Singh Indraprastha University, Delhi',degree='Bachelor of Technology in Computer Science Engineering',graduation_year=2029,cgpa='8.09/10.00',coursework=['Programming Fundamentals','Data Structures','Web Technologies','Object-Oriented Programming','Database Management Systems','Introduction to Machine Learning (Neural Networks Basics)']))
add('site_settings',dict(title='Rohit Kumar Yadav · AI, Data & Software',meta_description='Rohit Kumar Yadav is a Computer Science undergraduate at GGSIPU, Delhi, building practical projects with AI, data, and software.',footer_text='Built with curiosity and care.',show_about=True,show_projects=True,show_experiences=True,show_skills=True,show_education=True,show_interests=False,featured_only=False))
(root/'supabase/migrations/202611180002_content.sql').write_text('-- Initial content from supplied resume, user instructions, and inspected Mail Trace Monitor source.\n-- Month-only dates use day 01 for storage; the UI displays month and year only.\nbegin;\n'+'\n'.join(rows)+'\ncommit;\n',encoding='utf-8')
