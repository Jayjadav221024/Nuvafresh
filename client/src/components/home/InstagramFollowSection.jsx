import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const BAND = '#e9e1cd';

/**
 * The beige band behind the section. Its top edge is not level: it starts low
 * on the left and climbs gently to a taller, rounder corner on the right, which
 * is what gives the band its tilted-card look. Drawn as an SVG stretched to the
 * band's box; the band's height is fixed per breakpoint, so the stretch is small
 * and the corners stay round.
 */
const BandShape = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1046 320"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full"
  >
    <path
      d="M0 100 Q0 50 50 47 L974 2 Q1046 0 1046 72 L1046 284 Q1046 320 1010 320 L36 320 Q0 320 0 284 Z"
      fill={BAND}
    />
  </svg>
);

/**
 * "Come say Hi... on Instagram".
 *
 * A phone showing the Nuva Instagram profile hangs over the left of the band,
 * breaking out above and below it; the heading and handle sit in the middle,
 * and the profile QR code stands on the band's floor in a white arch on the right.
 * On phones the QR is dropped - it can't be scanned from the screen it is on -
 * and the handle button is the way through instead.
 */
const InstagramFollowSection = () => {
  const { getContent } = useContent();
  const headingLine1 = getContent('home.instagram', 'headingLine1', 'Come say Hi...');
  const headingLine2 = getContent('home.instagram', 'headingLine2', 'on Instagram');
  const handle = getContent('home.instagram', 'profileHandle', '@nuva_nutrition');
  const profileUrl = getContent('home.instagram', 'profileUrl', 'https://www.instagram.com/nuva_nutrition/');
  const phoneImage = getContent('home.instagram', 'phoneImage', '') || '/instagram/nuva-instagram-phone.png';
  const qrImage = getContent('home.instagram', 'qrImage', '') || '/instagram/nuva-instagram-qr.png';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      data-section-key="home.instagram"
      className="relative w-full bg-white px-4 sm:px-6 lg:px-8 pt-10 pb-12 md:pt-32 md:pb-36 xl:pt-40 xl:pb-44 overflow-hidden font-sans"
    >
      <div className="relative max-w-[1320px] mx-auto">

        {/* ---------- md and up: phone over the tilted band ---------- */}
        <div className="relative hidden md:block h-[340px] lg:h-[380px] xl:h-[440px]">
          <BandShape />

          {/* Phone, centred on the band's height and spilling out of both edges.
              The centring lives on the wrapper: the rise-in animates the image's
              own transform, which would otherwise wipe out the translate. */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[6%] z-10 w-[240px] lg:w-[300px] xl:w-[360px]">
            <motion.img
              src={phoneImage}
              alt={`Nuva Nutrition Instagram profile ${handle}`}
              className="w-full h-auto select-none pointer-events-none"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              loading="lazy"
              draggable={false}
            />
          </div>

          <div className="relative h-full grid grid-cols-[40%_1fr_auto] items-center gap-6 pr-10 lg:pr-14 xl:pr-16">
            <div />

            {/* Heading and handle */}
            <div className="pt-6">
              <h2 className="font-display text-[42px] lg:text-[54px] xl:text-[64px] 2xl:text-[72px] font-bold text-[#3b5634] tracking-tight leading-[1.08]">
                {headingLine1}
                <br />
                {headingLine2}
              </h2>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center px-7 py-3 xl:px-8 xl:py-3.5 rounded-full border border-[#2d472c]/70 text-[#3b5634] text-lg xl:text-xl hover:bg-[#2d472c] hover:text-white hover:border-[#2d472c] transition-colors"
              >
                {handle}
              </a>
            </div>

            {/* QR code in a white arch standing on the band's floor */}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${handle} on Instagram`}
              className="self-end block w-[180px] lg:w-[210px] xl:w-[250px] bg-white rounded-t-full rounded-b-3xl px-4 lg:px-5 xl:px-6 pt-14 lg:pt-16 xl:pt-20 pb-5 xl:pb-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src={qrImage}
                alt={`Scan to open ${handle} on Instagram`}
                className="w-full h-auto select-none"
                loading="lazy"
                draggable={false}
              />
            </a>
          </div>
        </div>

        {/* ---------- Phones: stacked ---------- */}
        <div className="md:hidden relative pt-48">
          <div className="relative rounded-[32px] px-6 pt-60 pb-10 text-center" style={{ background: BAND }}>
            <h2 className="font-display text-[40px] font-bold text-[#3b5634] tracking-tight leading-[1.1]">
              {headingLine1}
              <br />
              {headingLine2}
            </h2>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center px-6 py-2.5 rounded-full border border-[#2d472c]/70 text-[#3b5634] text-base hover:bg-[#2d472c] hover:text-white transition-colors"
            >
              {handle}
            </a>
          </div>

          <img
            src={phoneImage}
            alt={`Nuva Nutrition Instagram profile ${handle}`}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-auto select-none pointer-events-none"
            loading="lazy"
            draggable={false}
          />
        </div>

      </div>

      {/* Floating Scroll to Top Action Button on Bottom Right */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>
    </section>
  );
};

export default InstagramFollowSection;
