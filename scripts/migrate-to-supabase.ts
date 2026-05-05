import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local')
  console.log('Please add it before running this script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dataPath = (file: string) => path.join(process.cwd(), 'src/data', file)
const readData = (file: string) => JSON.parse(fs.readFileSync(dataPath(file), 'utf8'))

async function migrate() {
  console.log('🚀 Starting Migration...')

  try {
    // 1. Branches
    console.log('--- Migrating Branches ---')
    const branchesJson = readData('branches.json')
    const { data: branches, error: bErr } = await supabase.from('branches').upsert(
      branchesJson.map((b: any) => ({
        name: b.name,
        address: b.addr,
        phone: b.phone,
        manager_name: b.mgr || b['mgr: '],
        working_hours: b.hours,
        student_count: b.count
      })),
      { onConflict: 'name' }
    ).select()

    if (bErr) throw bErr
    console.log(`✅ Branches migrated: ${branches?.length}`)

    const branchMap = Object.fromEntries(branches?.map(b => [b.name, b.id]) || [])

    // 2. Countries
    console.log('--- Migrating Countries ---')
    const countriesJson = readData('countries.json')
    const { error: cErr } = await supabase.from('countries').upsert(
      countriesJson.map((c: any) => ({
        id: c.id,
        code: c.code,
        flag: c.flag,
        name: c.name,
        status: c.status === 'LIVE' ? 'LIVE' : 'DRAFT',
        hero_title: c.heroTitle,
        why_study: c.whyStudy,
        intakes: c.intakes,
        visa_time: c.visaTime,
        tuition_range: c.tuition,
        top_universities: c.universities ? c.universities.split(',').map((u: string) => u.trim()) : []
      }))
    )
    if (cErr) throw cErr
    console.log('✅ Countries migrated')

    // 3. Authors (Create a default author for blogs)
    console.log('--- Creating/Finding Default Author ---')
    let authorId;
    const { data: existingAuthor } = await supabase.from('authors').select('id').eq('name', 'Transit Education').maybeSingle()
    
    if (existingAuthor) {
      authorId = existingAuthor.id
      console.log('✅ Found existing author')
    } else {
      const { data: newAuthor, error: aErr } = await supabase.from('authors').insert({
        name: 'Transit Education',
        credential: 'Expert Consultant',
        bio: 'Leading study abroad consultancy in Nepal.'
      }).select().single()
      if (aErr) throw aErr
      authorId = newAuthor.id
      console.log('✅ Created new default author')
    }

    // 4. Blog Posts
    console.log('--- Migrating Blog Posts ---')
    const blogsJson = readData('blogPosts.json')
    const { error: blogErr } = await supabase.from('blog_posts').upsert(
      blogsJson.map((b: any) => ({
        title: b.title,
        slug: b.slug,
        body: b.body,
        category: b.category,
        tags: b.tags || [],
        status: b.status || 'published',
        publish_date: b.publishDate,
        featured_image: b.featuredImage,
        meta_title: b.metaTitle,
        meta_description: b.metaDescription,
        focus_keyword: b.focusKeyword,
        canonical_url: b.canonicalUrl,
        author_id: authorId,
        primary_question: b.primaryQuestion,
        answer_summary: b.answerSummary,
        faq_schema: b.faqItems || [],
        reading_time: b.readingTime
      })),
      { onConflict: 'slug' }
    )
    if (blogErr) throw blogErr
    console.log('✅ Blog posts migrated')

    // 5. FAQs
    console.log('--- Migrating FAQs ---')
    const faqsJson = readData('faqs.json')
    const { error: faqErr } = await supabase.from('faqs').upsert(
      faqsJson.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        category: f.category,
        page_path: f.page,
        status: f.status?.toLowerCase() === 'published' ? 'published' : 'draft',
        is_featured: !!f.featured,
        display_order: f.order || 0
      }))
    )
    if (faqErr) throw faqErr
    console.log('✅ FAQs migrated')

    // 6. Students (Leads)
    console.log('--- Migrating Students ---')
    const studentsJson = readData('students.json')
    const { error: sErr } = await supabase.from('students').upsert(
      studentsJson.map((s: any) => ({
        name: s.name,
        phone: s.phone,
        email: s.email,
        branch_id: branchMap[s.branch],
        interested_country_id: s.country?.toLowerCase().replace(/\s+/g, '-'),
        counselor_name: s.counselor,
        status: s.status,
        notes: s.notes,
        applied_date: s.date
      }))
    )
    if (sErr) throw sErr
    console.log('✅ Students migrated')

    // 7. Success Stories
    console.log('--- Migrating Success Stories ---')
    const successJson = readData('successStories.json')
    const { error: ssErr } = await supabase.from('success_stories').upsert(
      successJson.map((s: any) => ({
        student_name: s.name,
        country_id: s.country?.toLowerCase().replace(/\s+/g, '-'),
        university: s.university,
        year: s.year,
        course: s.course,
        approval_image_url: s.approvalImage
      }))
    )
    if (ssErr) throw ssErr
    console.log('✅ Success stories migrated')

    // 8. Testimonials
    console.log('--- Migrating Testimonials ---')
    const testimonialsJson = readData('testimonials.json')
    const { error: tErr } = await supabase.from('testimonials').upsert(
      testimonialsJson.map((t: any) => ({
        student_name: t.name,
        course: t.course,
        university: t.university,
        country_id: t.country?.toLowerCase().replace(/\s+/g, '-'),
        body: t.body,
        rating: t.rating,
        photo_url: t.photo
      }))
    )
    if (tErr) throw tErr
    console.log('✅ Testimonials migrated')

    // 9. Team Members
    console.log('--- Migrating Team Members ---')
    const teamJson = readData('team.json')
    const { error: teamErr } = await supabase.from('team_members').upsert(
      teamJson.map((t: any) => ({
        name: t.name,
        role: t.role,
        branch_id: branchMap[t.branch],
        photo_url: t.photo
      }))
    )
    if (teamErr) throw teamErr
    console.log('✅ Team members migrated')

    // 10. Site Settings
    console.log('--- Migrating Site Settings ---')
    const settingsJson = readData('siteSettings.json')
    const { error: setErr } = await supabase.from('site_settings').upsert({
      id: 1,
      site_name: settingsJson.siteName,
      tagline: settingsJson.tagline,
      contact_email: settingsJson.email,
      contact_phone: settingsJson.phone,
      office_address: settingsJson.address,
      social_links: settingsJson.socials,
      seo_config: settingsJson.seo
    })
    if (setErr) throw setErr
    console.log('✅ Site settings migrated')

    console.log('\n✨ MIGRATION COMPLETE! All data is now in Supabase.')
  } catch (error) {
    console.error('\n❌ Migration Failed:', error)
  }
}

migrate()
