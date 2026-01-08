'use client';

const clouds = [
  { position: 'left: 10%' },
  { position: 'left: 30%' },
  { position: 'left: 50%' },
  { position: 'left: 70%' },
  { position: 'left: 90%' },
];

export default function DecorativeClouds() {
  return (
    <div className="decorative-clouds-container">
      {clouds.map((cloud, index) => {
        const [property, value] = cloud.position.split(':');
        return (
          <div
            key={`cloud-${index}`}
            className="puffy-cloud"
            style={{
              ['--delay' as string]: `${index * 0.5}s`,
              [property]: value.trim(),
            } as React.CSSProperties}
          >
          <pre className="cloud-ascii text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] leading-none select-none">
{`                 _
              (\`  ).                   _
             (     ).              .:(\`  )\`.
)           _(       '\`.          :(   .    )
        .=(\`(      .   )     .--  \`.  (    ) )
       ((    (..__.:'-'   .+(   )   \` _\`  ) )
\`.     \`(       ) )       (   .  )     (   )  ._
  )      \` __.:' )     (   (   ))     \`-'.-(\`  )
)  )  ( )       --'       \`- __.'         :(      ))
.-'  (_.'          .')                    \`(    )  ))
                  (_  )                     \` __.:' `}
          </pre>
          </div>
        );
      })}
    </div>
  );
}
