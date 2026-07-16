import type { ConditionNote } from "@/models";

export function MachineCondition({ summary, notes }: { summary: string; notes: ConditionNote[] }) { return <section className="section"><h2>Tình trạng thực tế</h2><p>{summary}</p>{notes.length ? <ul>{notes.map((note) => <li key={`${note.area}-${note.summary}`}>{note.summary}</li>)}</ul> : null}</section>; }
