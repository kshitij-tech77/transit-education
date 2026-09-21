import { SITE_URL } from "@/lib/site-url";
import { getIndexablePosts } from "@/lib/blog-posts";

// Regenerated at most hourly, and immediately when the CMS publishes, edits,
// unpublishes or deletes a post (see revalidateBlog).
export const revalidate = 3600;

const MAX_POSTS = 25;

/** One line per post: title, absolute URL and a one-line description. */
async function latestPostLines(): Promise<string> {
  try {
    const posts = await getIndexablePosts(MAX_POSTS);
    if (posts.length === 0) return "";
    const lines = posts.map((post) => {
      const summary = post.description ? `: ${post.description}` : "";
      return `- [${post.title}](${SITE_URL}/blog/${post.slug})${summary}`;
    });
    return `\nLatest articles:\n\n${lines.join("\n")}\n`;
  } catch (error) {
    // The static sections below are still useful without the post list.
    console.error("[llms.txt] could not read blog posts:", error);
    return "";
  }
}

export async function GET() {
  const latestPosts = await latestPostLines();

  const body = `# Transit Education

> Nepal's most trusted study abroad consultancy. 10+ years of experience helping Nepali students study in Canada, Australia, UK, USA, New Zealand, Ireland, South Korea, Italy, and Europe.

Transit Education is a registered education consultancy headquartered in Kathmandu, Nepal, with branches in Itahari, Damak, and Damauli. We help students navigate university admissions, student visa applications, IELTS/PTE preparation, and scholarship opportunities across 15+ global destinations.

## Services

- **Admission Counselling**: University shortlisting, SOP writing, LOR guidance, application filing for 50+ partner institutions worldwide. See: ${SITE_URL}/services/admission-counselling
- **Student Visa Service**: Full IRCC, subclass 500, UK Tier-4, and other visa file preparation with interview coaching. See: ${SITE_URL}/services/student-visa-service
- **Scholarships Assistance**: Identification and application guidance for merit-based and need-based scholarships. See: ${SITE_URL}/services/scholarships-assistance
- **Test Preparation**: IELTS, PTE Academic, and TOEFL coaching. See: ${SITE_URL}/services/test-preparation
- **Language Training**: English language courses for academic and professional purposes. See: ${SITE_URL}/courses/language-training

## Study Destinations

- Canada: ${SITE_URL}/study-abroad/canada
- Australia: ${SITE_URL}/study-abroad/australia
- United Kingdom: ${SITE_URL}/study-abroad/uk
- United States: ${SITE_URL}/study-abroad/usa
- New Zealand: ${SITE_URL}/study-abroad/new-zealand
- Ireland: ${SITE_URL}/study-abroad/ireland
- South Korea: ${SITE_URL}/study-abroad/south-korea
- Italy: ${SITE_URL}/study-abroad/italy

## Branches / Locations

- Kathmandu (Head Office): Level 2, Purple House, Bagbazar, Kathmandu-4 | +977-01-5906277 | ${SITE_URL}/locations/kathmandu
- Itahari: Rano Complex, Sangit Chowk, Itahari, Sunsari | +977-025-590570 | ${SITE_URL}/locations/itahari
- Damak: ${SITE_URL}/locations/damak
- Damauli: ${SITE_URL}/locations/damauli

## Key Facts

- Founded: 2014
- Visa success rate: 98%+
- Students processed: 2,000+
- Partner institutions: 50+
- Countries served: 15+

## Blog & Resources

Latest guides on study abroad, visa requirements, IELTS prep, and scholarship tips: ${SITE_URL}/blog
${latestPosts}

Free downloadable resources for Nepali students: ${SITE_URL}/resources

## Contact

- Website: ${SITE_URL}
- Email: info@transiteducation.com.np
- Phone: +977-01-5906277
- Contact form: ${SITE_URL}/contact

## Optional

- About: ${SITE_URL}/about
- Team: ${SITE_URL}/team
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
