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
      {clouds.map((cloud, index) => (
        <div
          key={`cloud-${index}`}
          className="puffy-cloud"
          style={{
            ['--delay' as any]: `${index * 0.5}s`,
            [cloud.position.split(':')[0] as any]: cloud.position.split(':')[1].trim(),
          }}
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
      ))}
    </div>
  );
}
