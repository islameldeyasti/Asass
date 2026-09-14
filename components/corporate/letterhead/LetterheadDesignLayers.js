'use client';

/**
 * Freeform design layers — logos + shapes drawn on the A4 page.
 */
export default function LetterheadDesignLayers({layers = []}) {
  const list = Array.isArray(layers) ? [...layers] : [];
  list.sort((a, b) => (a.z || 0) - (b.z || 0));
  if (!list.length) return null;

  return (
    <div className="lh-design-layers" aria-hidden>
      {list.map((layer) => {
        const style = {
          left: `${layer.x}mm`,
          top: `${layer.y}mm`,
          width: `${layer.w}mm`,
          height: `${layer.h}mm`,
          opacity: layer.opacity ?? 1,
          zIndex: 2 + (layer.z || 0),
        };

        if (layer.type === 'logo') {
          if (!layer.src) {
            return (
              <div
                key={layer.id}
                className="lh-design-layer lh-design-layer--logo-empty"
                style={style}
              />
            );
          }
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={layer.id}
              className="lh-design-layer lh-design-layer--logo"
              src={layer.src}
              alt=""
              style={style}
            />
          );
        }

        return (
          <div
            key={layer.id}
            className={`lh-design-layer lh-design-layer--${layer.type}`}
            style={{
              ...style,
              background: layer.color || '#070463',
            }}
          />
        );
      })}
    </div>
  );
}
