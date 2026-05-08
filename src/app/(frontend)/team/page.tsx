import SectionLabel from "@/components/shared/SectionLabel";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function TeamPage() {
  const { data: teamRaw } = await supabase
    .from('team_members')
    .select(`
      *,
      branches (name)
    `)
    .order('name', { ascending: true });

  const teamData = teamRaw?.map(m => ({
    ...m,
    role: m.role,
    photo: m.photo_url,
    branch: (m as any).branches?.name || 'N/A'
  })) || [];

  const leadership = teamData.filter(m => {
    const role = (m.role || '').toLowerCase();
    return role.includes('ceo') || role.includes('director') || role.includes('founder');
  });
  const staff = teamData.filter(m => !leadership.find(l => l.id === m.id));

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-black py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/media/2021/05/amy-hirschi-JaoVGh5aJ3E-unsplash-scaled.jpg"
            alt="Transit Education Team"
            fill
            className="object-cover"
          />
        </div>
        <div className="container relative z-10 text-center">
          <SectionLabel className="text-white border-white/20 bg-white/10 mx-auto">Our Team</SectionLabel>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-8">
            Meet the Experts Behind <span className="text-brand">Your Success</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Our team is comprised of dedicated professionals who have years of experience in the field of education, consulting and management in Nepal.
          </p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <SectionLabel>Leadership</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Visionary Leadership</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {leadership.map((member, index) => (
              <div key={index} className="group">
                <div className="relative h-[450px] w-full rounded-[2.5rem] overflow-hidden mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-black mb-1">{member.name}</h3>
                  <p className="text-brand font-semibold mb-2">{member.role}</p>
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" /> {member.branch} Branch
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team Section */}
      <section className="py-24 bg-off-white">
        <div className="container">
          <div className="text-center mb-16">
            <SectionLabel>Our Core Team</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">Admissions & Support</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm font-medium mb-3">{member.role}</p>
                <div className="flex items-center gap-1 text-gray-400 text-xs uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-brand" /> {member.branch}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career CTA */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="bg-black rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-brand rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            </div>
            
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join Our Growing Team</h2>
              <p className="text-gray-400 leading-relaxed">
                We're always looking for passionate individuals who want to help students achieve their dreams of studying abroad.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0">
              <a 
                href="/contact" 
                className="inline-block bg-brand text-white px-10 py-5 rounded-full font-bold hover:bg-white hover:text-brand transition-all shadow-xl"
              >
                Work With Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
