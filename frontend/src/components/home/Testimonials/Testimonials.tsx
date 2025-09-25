import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/testimonials.css';

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

function Testimonials() {
  const { t, translations } = useTranslation();

  const testimonials = useMemo(() => {
    const items = translations?.testimonials?.items;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item: any) => typeof item?.quote === 'string' && typeof item?.author === 'string' && typeof item?.role === 'string',
    ) as Testimonial[];
  }, [translations]);

  return (
    <section className="testimonials">
      <div className="section-heading">
        <p className="eyebrow">{t('testimonials.eyebrow', 'Trusted by creative teams')}</p>
        <h2>{t('testimonials.title', 'Designed for editors, product teams, and automation.')}</h2>
      </div>
      <div className="testimonial-list">
        {testimonials.map((entry) => (
          <blockquote key={entry.author}>
            <p>&ldquo;{entry.quote}&rdquo;</p>
            <footer>
              <span>{entry.author}</span>
              <span>{entry.role}</span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
