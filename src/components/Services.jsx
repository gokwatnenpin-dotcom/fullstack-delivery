const services = [
  ['General care', 'Everyday health questions, checkups, and ongoing support.', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v10M7 12h10'],
  ['Heart health', 'Specialist guidance, prevention, and cardiac monitoring.', 'M20 6.5C20 4.6 18.5 3 16.5 3c-1.8 0-3 1-4.5 2.8C10.5 4 9.3 3 7.5 3A4.5 4.5 0 0 0 3 7.5C3 13 12 20 12 20s8-6.7 8-13.5Z'],
  ['Care for children', 'Thoughtful, age-appropriate care for growing families.', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 10h.01M15.5 10h.01M8.5 15c2 1.5 5 1.5 7 0'],
  ['Mental wellbeing', 'Private support for stress, mood, and life changes.', 'M12 3a7 7 0 0 0-7 7c0 3 1.6 5.6 4 6.8V21l3-2 3 2v-4.2A7 7 0 0 0 19 10a7 7 0 0 0-7-7Z'],
  ['Lab & diagnostics', 'Clear answers from dependable testing and screening.', 'M9 3h6M10 3v6l-4 8a3 3 0 0 0 2.7 4h6.6a3 3 0 0 0 2.7-4l-4-8V3M8.5 16h7'],
  ['Urgent support', 'Responsive care when you need help without delay.', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v10M7 12h10'],
];

const Services = () => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(([title, description, path]) => <article key={title} className="group rounded-xl border border-primary-100 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_14px_35px_-22px_rgba(18,60,57,.4)]"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={path} strokeLinecap="round" strokeLinejoin="round" /></svg></span><h3 className="mt-5 text-lg font-semibold text-primary-900">{title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">Learn more <span aria-hidden="true">→</span></span></article>)}</div>;
export default Services;
