import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
  return (
    <div className="story-journal-page">
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

          <div className="story-journal__ingredient-grid">
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
    </div>
  );
};

export default Story;
