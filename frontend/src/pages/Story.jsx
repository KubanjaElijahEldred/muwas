import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone, QrCode } from 'lucide-react';

const ingredients = [
  {
    title: 'JUNIPER BERRIES',
    body: 'The classic gin backbone, delivering piney freshness and depth.',
    image: '/images/image10.png',
  },
  {
    title: 'ORANGE PEEL',
    body: 'Adds bright citrus aroma and a warm, zesty character.',
    image: '/images/image11.png',
  },
  {
    title: 'CORIANDER',
    body: 'Brings subtle spice and citrus notes that enhance complexity.',
    image: '/images/image12.png',
  },
  {
    title: 'LEMONGRASS',
    body: 'Fresh, aromatic and herbal, giving a clean citrus lift.',
    image: '/images/image13.png',
  },
  {
    title: 'ORRIS ROOT',
    body: 'Provides smooth floral depth and a velvety botanical balance.',
    image: '/images/image14.png',
  },
  {
    title: 'A FEW OTHER BOTANICALS',
    body: 'Carefully selected ingredients for balance, aroma and a signature finish.',
    image: '/images/image9.png',
  },
];

const Story = () => {
  const [showFullStory, setShowFullStory] = useState(false);

  return (
    <div className="story-journal-page">
      <section className="story-full-toggle">
        <button type="button" onClick={() => setShowFullStory((current) => !current)}>
          {showFullStory ? 'Hide Our Story' : 'Our Story'}
        </button>
      </section>

      {showFullStory && (
        <section className="story-full-sheet">
          <header className="story-full-sheet__header">
            <strong>Muwas Distilling Story</strong>
            <span>
              Tel: +256772522646 • muwasdistilling@gmail.com • Nantale Oasis breadfruit, Kaseesa
              Village, Kyabutaika Parish, Kakkooge Sub-county, Nakasongola District
            </span>
          </header>

          <div className="story-full-sheet__body">
            <h2>Options for Label Backstory</h2>
            <ol>
              <li>
                Forged in the heart of Uganda during the stillness of the pandemic, this gin is a
                tribute to resilience and hope. Crafted from homegrown bananas, lemongrass, and
                citrus, it transforms humble ingredients into a bold spirit born of struggle and
                determination. Every sip honors the culture that carried us forward and the dreams
                that refused to fade.
              </li>
              <li>
                In the quiet of a paused world, this gin was born where bananas, lemongrass, and
                citrus rose from the soil like a promise. Distilled through hardship, it carries
                the soul of a people who turned struggle into spirit. Sip by sip, it sings of
                resilience, roots, and the hope that grew when everything else stood still.
              </li>
              <li>
                Born on Ugandan soil during a time of stillness and struggle, this spirit is a
                quiet triumph of resilience. From our fields came bananas, lemongrass, and citrus,
                humble gifts transformed with care and courage. Every drop carries the weight of
                what we endured, and the light of what we dreamed.
              </li>
              <li>
                When the world shut down, we turned to our land and to each other. From the
                bananas we grew and the lemongrass we gathered, this gin was born, not just from
                ingredients, but from the will to create something meaningful. It is our story in a
                bottle: a spirit shaped by hardship, and lifted by hope.
              </li>
              <li>
                Crafted in Uganda at a time when the world hit pause, this gin is our answer to
                uncertainty: bold, local, and full of soul. We took ripe bananas, zesty lemongrass,
                and citrus straight from our soil and turned them into something unforgettable. It
                is not just a drink, it is a vibe born from resilience, rooted in culture, and made
                to be shared.
              </li>
              <li>
                Distilled in the heart of Kakoooge, this gin is a rare expression of resilience and
                refinement. Ripe bananas, handpicked lemongrass, and sun-kissed citrus are
                transformed into a silky spirit that honors our heritage with every pour. It is a
                taste of Uganda&apos;s elegance crafted through adversity, meant to be savored.
              </li>
            </ol>
          </div>
        </section>
      )}

      <div className="story-journal">
        <section className="story-journal__left">
          <header className="story-journal__header">
            <div>
              <p>MUWAS DISTILLING JOURNAL</p>
            </div>
            <span>OUR STORY</span>
          </header>

          <div className="story-journal__hero">
            <article className="story-journal__intro">
              <h1>
                <span>Our Story,</span>
                Crafted in
                <br />
                Uganda.
              </h1>
              <h3>FROM OUR LAND. FOR THE WORLD.</h3>
              <p>
                Every bottle begins from the land harvested by hand, distilled with patience, and
                crafted to reflect Uganda&apos;s rich botanical heritage.
              </p>
            </article>
            <figure className="story-journal__hero-image">
              <img src="/images/image1.png" alt="Farmer harvesting botanicals" />
            </figure>
          </div>

          <div className="story-journal__left-grid">
            <article className="story-journal__seal">
              <div className="story-journal__seal-ring">CRAFTED IN UGANDA</div>
            </article>

            <article className="story-journal__note">
              <h4>ROOTED IN OUR LAND</h4>
              <p>
                From the volcanic soils of Uganda to every harvest by hand, our botanicals are grown
                with care by local farmers who know the land best.
              </p>
            </article>

            <figure className="story-journal__image-card">
              <img src="/images/image3.png" alt="Local citrus orchard" />
            </figure>

            <article className="story-journal__note">
              <h4>DISTILLED WITH PURPOSE</h4>
              <p>
                Our small-batch distillation process honors traditional craftsmanship and modern
                precision, capturing the pure soul of our ingredients in every drop.
              </p>
            </article>

            <figure className="story-journal__image-card story-journal__image-card--wide">
              <img src="/images/image4.png" alt="Distillation team at work" />
            </figure>
          </div>

          <div className="story-journal__bottom-row">
            <figure>
              <img src="/images/image5.png" alt="Muwas farm landscape" />
            </figure>
            <article>
              <h4>CRAFTED FOR MOMENTS THAT MATTER</h4>
              <p>
                Whether shared in celebration or savored in quiet moments, Muwas spirits are made
                to elevate every experience.
              </p>
            </article>
          </div>

          <div className="story-journal__cta">
            <div>
              <strong>DISCOVER THE FULL MUWAS STORY</strong>
              <span>Explore our origins, details, and unique ingredients in each flavour.</span>
            </div>
            <Link to="/products">
              EXPLORE NOW
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <section className="story-journal__right">
          <div className="story-journal__ingredients-head">
            <p>OUR INGREDIENTS</p>
            <h2>
              <span>Nature&apos;s finest,</span>
              Handpicked.
            </h2>
            <p>
              Each botanical is carefully selected for its quality, character, and contribution to
              our unique flavors.
            </p>
          </div>

          <div className="story-journal__ingredient-grid" dir="rtl">
            {ingredients.map((item) => (
              <article key={item.title} className="story-journal__ingredient-card">
                <img src={item.image} alt={item.title} />
                <div>
                  <h5>{item.title}</h5>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="story-journal__spirits-band">
            <article className="story-journal__spirits-copy">
              <p>OUR SPIRITS</p>
              <h3>Crafted with care.</h3>
              <span>
                From small batch distillation to careful bottling, every step is done with
                precision, passion, and purpose.
              </span>
            </article>

            <figure className="story-journal__spirits-image">
              <img src="/images/image6.png" alt="Muwas spirits and botanicals" />
            </figure>

            <article className="story-journal__spirits-notes">
              <div>
                <h6>COFFEE FLAVOURED VODKA</h6>
                <p>Premium vodka infused with locally sourced coffee beans. Rich. Smooth. Distinctly Ugandan.</p>
              </div>
              <div>
                <h6>KAKOGE GIN</h6>
                <p>A vibrant botanical gin inspired by Uganda&apos;s landscape. Crisp, aromatic and authentic.</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <section className="story-editorial-grid">
        {[
          '/images/image1.png',
          '/images/image3.png',
          '/images/image4.png',
          '/images/image5.png',
          '/images/image6.png',
          '/images/image7.png',
          '/images/image8.png',
          '/images/product.png',
        ].map((src, index) => (
          <article key={`${src}-${index}`} className="story-editorial-card">
            <img src={src} alt="Muwas editorial story card" />
          </article>
        ))}
      </section>

      <section className="contact-info-strip">
        <article>
          <MapPin size={24} />
          <div>
            <strong>OUR LOCATION</strong>
            <span>Muwas Farm, Masaka Road corridor, Uganda</span>
          </div>
        </article>
        <article>
          <Phone size={24} />
          <div>
            <strong>CALL / WHATSAPP</strong>
            <span>+256 123 456 789 • Mon-Sat, 9:00 AM to 6:00 PM EAT</span>
          </div>
        </article>
        <article>
          <Mail size={24} />
          <div>
            <strong>EMAIL US</strong>
            <span>info@muwasdistilling.ug • tours@muwasdistilling.ug</span>
          </div>
        </article>
        <article>
          <QrCode size={24} />
          <div>
            <strong>SCAN TO CONNECT</strong>
            <span>Scan our code for any further information</span>
          </div>
        </article>
      </section>

      <section className="contact-cta-strip">
        <div>
          <strong>LET&apos;S CREATE MEMORABLE EXPERIENCES</strong>
          <span>From our land to your glass, we&apos;re honoured to be part of your journey.</span>
        </div>
        <Link to="/products">
          EXPLORE OUR SPIRITS
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Story;
