/**
 * Upgrades a config.json written before events were dynamic (`personal` plus
 * `events.family` / `events.work`) to the current shape. Content is kept as
 * it was; each old card becomes an event targeted at the group that used to
 * see it. Returns the input untouched when it is already current.
 */

type Loose = Record<string, any>;

const DEFAULT_GROUPS = [
  { id: "friends", name: "Amigos" },
  { id: "family", name: "Familia" },
  { id: "work", name: "Trabajo" },
];

const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function migrateConfig(raw: Loose): { config: Loose; migrated: boolean } {
  if (Array.isArray(raw.events)) return { config: raw, migrated: false };

  const legacyEvent = (id: string, group: string, e: Loose) => ({
    id,
    published: true,
    title: e.title,
    paragraphs: splitParagraphs(String(e.description ?? "")).length
      ? splitParagraphs(String(e.description))
      : [String(e.title)],
    ps: "",
    date: e.date ?? null,
    time: e.time ?? null,
    food: e.food ?? [],
    requirements: [],
    location: e.location ?? null,
    groups: [group],
    include: [],
    exclude: [],
  });

  const personal = raw.personal ?? {};
  const events = [
    {
      id: "personal",
      published: true,
      title: personal.title ?? "Invitación Personal",
      paragraphs: personal.paragraphs?.length ? personal.paragraphs : ["Te espero para festejar."],
      ps: personal.ps ?? "",
      date: null,
      time: null,
      food: [],
      requirements: personal.requirements ?? [],
      location: null,
      groups: ["friends"],
      include: [],
      exclude: [],
    },
    ...(raw.events?.family ? [legacyEvent("almuerzo-familiar", "family", raw.events.family)] : []),
    ...(raw.events?.work ? [legacyEvent("after-laboral", "work", raw.events.work)] : []),
  ];

  const { personal: _personal, ...rest } = raw;
  return {
    config: { ...rest, groups: raw.groups ?? DEFAULT_GROUPS, events },
    migrated: true,
  };
}
