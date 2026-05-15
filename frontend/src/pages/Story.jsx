import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone, QrCode } from 'lucide-react';

const ingredients = [
  {
    title: 'JUNIPER BERRIES',
    body: 'The classic gin backbone, delivering piney freshness and depth. It anchors the spirit with crisp structure and a long, clean forest-like finish in every sip.',
    image: '/images/image10.png',
  },
  {
    title: 'ORANGE PEEL',
    body: 'Adds bright citrus aroma and a warm, zesty character. Sun-dried peel oils lift the nose and bring a lively, refreshing sparkle to the palate.',
    image: '/images/image11.png',
  },
  {
    title: 'CORIANDER',
    body: 'Brings subtle spice and citrus notes that enhance complexity. Its gentle peppery warmth connects the florals and citrus into one balanced botanical profile.',
    image: '/images/image12.png',
  },
  {
    title: 'LEMONGRASS',
    body: 'Fresh, aromatic and herbal, giving a clean citrus lift. It contributes a soft green brightness that keeps the spirit vibrant and beautifully layered.',
    image: '/images/image13.png',
  },
  {
    title: 'ORRIS ROOT',
    body: 'Provides smooth floral depth and a velvety botanical balance. As a natural binder, it harmonizes each note for a rounded mouthfeel and elegant finish.',
    image: '/images/image14.png',
  },
  {
    title: 'A FEW OTHER BOTANICALS',
    body: 'Carefully selected ingredients for balance, aroma and a signature finish. Together they build nuance, softness, and the distinct Muwas character that lingers.',
    image: '/images/image9.png',
  },
];

const editorialCards = [
  {
    image: '/images/image1.png',
    title: 'Harvested By Hand',
    description: 'Every season starts with careful handpicking from trusted local growers.',
  },
  {
    image: '/images/image3.png',
    title: 'Rooted In Orchards',
    description: 'Fresh citrus and botanicals are sourced at peak ripeness for bold flavor.',
  },
  {
    image: '/images/image4.png',
    title: 'Distilled With Precision',
    description: 'Our team refines every batch with a balance of tradition and modern craft.',
  },
  {
    image: '/images/image5.png',
    title: 'From Land To Bottle',
    description: 'The farm landscape shapes the character, aroma, and soul of each spirit.',
  },
  {
    image: '/images/image6.png',
    title: 'Signature Spirits',
    description: 'Kakoge Gin and Coffee Flavoured Vodka represent our proudly Ugandan craft.',
  },
  {
    image: '/images/image7.png',
    title: 'Small Batch Quality',
    description: 'Controlled batch sizes help us keep consistency, clarity, and premium finish.',
  },
  {
    image: '/images/image8.png',
    title: 'Cultural Heritage',
    description: 'Our story blends resilience, local identity, and meaningful craftsmanship.',
  },
  {
    image: '/images/product.png',
    title: 'Built For Moments',
    description: 'From celebrations to tasting tours, each bottle is made to be remembered.',
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
              <p>
                What starts in our fields is carried forward by skilled hands, careful timing, and
                a deep respect for local ingredients.
              </p>
              <p>
                From first harvest to final seal, we focus on clarity, balance, and a flavor
                profile that feels proudly Ugandan in every pour.
              </p>
              <p>
                This is more than production. It is a living craft shaped by people, place, and a
                commitment to quality that never cuts corners.
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
              <p>
                This deep connection to place gives our spirits their authentic identity, rooted in
                local knowledge, seasonality, and respect for nature.
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
              <p>
                Every run is monitored closely to preserve aroma, clarity, and consistency, ensuring
                each bottle reflects the same quality from start to finish.
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
            <div className="story-journal__ingredients-story">
              <p>
                We begin with growers who understand every season, every soil shift, and every
                harvest window. Their care at the source is what gives our spirits true clarity and
                character.
              </p>
              <p>
                From bright citrus lift to warm spice and floral depth, each ingredient is chosen to
                play a precise role. Nothing is random, and nothing is rushed.
              </p>
              <p>
                Together, these botanicals create a profile that is bold yet balanced, vibrant yet
                smooth, and unmistakably rooted in Uganda.
              </p>
              <p>
                We inspect, sort, and prepare each botanical in small quantities so freshness and
                aroma are protected before distillation begins.
              </p>
              <p>
                The result is a spirit with structure, elegance, and identity, crafted to be enjoyed
                neat, on ice, or in cocktails that celebrate local flavor.
              </p>
              <p>
                Every bottle carries the story of our farmers, our process, and our place. That is
                why our ingredients are not just selected, they are respected.
              </p>
            </div>
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
        {editorialCards.map((item) => (
          <article key={item.title} className="story-editorial-card">
            <img src={item.image} alt={item.title} />
            <div className="story-editorial-card__copy">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="story-production-area">
        <article className="story-production-area__copy">
          <p>PRODUCTION AREA</p>
          <h3>Where Craft Meets Precision</h3>
          <span>
            From carefully prepared botanicals to controlled small-batch distillation, our
            production floor combines traditional craft with disciplined quality checks at every
            stage.
          </span>
          <span>
            Each run is monitored to preserve clarity, aroma, and consistency, ensuring every
            bottle carries the signature Muwas character from start to finish.
          </span>
        </article>

        <div className="story-production-area__gallery">
          <figure>
            <img src="/images/production1.png" alt="Muwas production area and distillation setup" />
          </figure>
          <figure>
            <img src="/images/production2.png" alt="Muwas team working in the production area" />
          </figure>
        </div>
      </section>

      <section className="contact-info-strip">
        <article>
          <MapPin size={24} />
          <div>
            <strong>OUR LOCATION</strong>
            <span>Nantale Oasis breadfruit, Kaseesa Village, Kyabutaika Parish, Kakkooge Sub-county, Nakasongola District</span>
          </div>
        </article>
        <article>
          <Phone size={24} />
          <div>
            <strong>CALL / WHATSAPP</strong>
            <span>+256772522646</span>
          </div>
        </article>
        <article>
          <Mail size={24} />
          <div>
            <strong>EMAIL US</strong>
            <span>muwasdistilling@gmail.com</span>
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
