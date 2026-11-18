export function ProjectJournal({ content }: { content: string }) {
  return (
    <>
      {content
        .split('\n')
        .filter(Boolean)
        .map((line, index) =>
          line.startsWith('## ') ? <h3 key={index}>{line.slice(3)}</h3> : <p key={index}>{line}</p>,
        )}
    </>
  );
}
