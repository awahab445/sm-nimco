const FEATURES = [
  {
    emoji: '🚚',
    title: 'All Pakistan Delivery',
    description: 'Fast shipping to your doorstep',
  },
  {
    emoji: '🍃',
    title: '100% Fresh & Authentic',
    description: 'Made with premium ingredients',
  },
  {
    emoji: '💳',
    title: 'Cash on Delivery',
    description: 'Pay securely upon arrival',
  },
  {
    emoji: '📦',
    title: 'Bulk & Household Packs',
    description: 'Ideal for events & family snacking',
  },
] as const;

export function SmNimcoStoreFeatures() {
  return (
    <section
      className="border-y border-gray-800 bg-gray-800 px-4 py-10 sm:px-8 sm:py-12"
      aria-label="Store features"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center gap-2 text-center sm:gap-2.5">
            <span className="text-2xl sm:text-3xl" aria-hidden>
              {feature.emoji}
            </span>
            <h3 className="text-sm font-bold text-white sm:text-base">{feature.title}</h3>
            <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
