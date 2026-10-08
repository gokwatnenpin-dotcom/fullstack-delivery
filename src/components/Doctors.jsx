import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProviders } from '../lib/api';

const fallbackDoctors = [
  { name: 'Dr. Sarah Chen', specialty: 'Cardiology', bio: '15+ years of experience in interventional cardiology and preventive heart care.', image: '1594824473246-4bace31b9814' },
  { name: 'Dr. Michael Rodriguez', specialty: 'Pediatrics', bio: 'Board-certified pediatrician specializing in child development and adolescent health.', image: '1612349317146-e7d8c7fb5c1a' },
  { name: 'Dr. Amanda Foster', specialty: 'Mental wellbeing', bio: 'Licensed clinical psychologist focused on practical, compassionate support.', image: '1576091160550-2173dba999ef' },
  { name: 'Dr. David Kim', specialty: 'Family medicine', bio: 'Family physician focused on prevention and long-term health partnerships.', image: '1551836022-d5d5140019c6' },
  { name: 'Dr. Lisa Wong', specialty: 'Laboratory medicine', bio: 'Pathologist specializing in clear, accurate diagnostic insights.', image: '1598624352813-24d3b7b7a2ec' },
  { name: 'Dr. James Wilson', specialty: 'Urgent care', bio: 'Emergency physician with expertise in trauma care and critical interventions.', image: '1602091407530-28e4e1f5d8e0' },
];

const Doctors = () => {
  const [doctors, setDoctors] = useState(fallbackDoctors);

  useEffect(() => {
    getProviders().then(({ providers }) => {
      if (providers?.length) {
        setDoctors(providers.map((provider, index) => ({
          name: `Dr. ${provider.firstName} ${provider.lastName}`,
          specialty: provider.specialty,
          bio: provider.bio || 'Experienced clinician focused on thoughtful, patient-centred care.',
          image: fallbackDoctors[index % fallbackDoctors.length].image,
        })));
      }
    }).catch(() => { /* Keep directory available while the API is offline. */ });
  }, []);

  return <section className="bg-background-dark py-16 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="eyebrow">Your care team</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-primary-900">Meet the people behind your care.</h1><p className="mt-4 leading-7 text-text-secondary">Experienced clinicians who listen carefully and work with you toward better health.</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{doctors.map((doctor) => <article key={doctor.name} className="overflow-hidden rounded-xl border border-primary-100 bg-white"><img src={`https://images.unsplash.com/photo-${doctor.image}?w=700&q=80&fit=crop`} alt={`${doctor.name} portrait`} className="h-56 w-full object-cover object-top" /><div className="p-6"><p className="text-xs font-bold uppercase tracking-[.12em] text-primary-600">{doctor.specialty}</p><h2 className="mt-2 text-xl font-semibold text-primary-900">{doctor.name}</h2><p className="mt-3 text-sm leading-6 text-text-secondary">{doctor.bio}</p><Link to="/contact" className="mt-5 inline-flex text-sm font-semibold text-primary-700 hover:text-primary-800">Book with {doctor.name.split(' ')[1]} →</Link></div></article>)}</div></div></section>;
};

export default Doctors;
