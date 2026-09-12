import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  ExternalLink,
  Eye,
  Hash,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  Palette,
  RefreshCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
} from 'lucide-react';
import {
  getGetWebhookStatusQueryKey,
  getHealthCheckQueryKey,
  useGetWebhookStatus,
  useHealthCheck,
  useSendWebhook,
} from '@workspace/api-client-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type RuleSection = {
  id: string;
  emoji: string;
  title: string;
  body: string;
};

const initialSections: RuleSection[] = [
  {
    id: 'section-1',
    emoji: '🤝',
    title: 'Respect',
    body: '• No harassment, hate speech, threats, or discrimination.\n• No doxxing or sharing private information.\n• No impersonating staff members or other players.',
  },
  {
    id: 'section-2',
    emoji: '⚔️',
    title: 'Fair Play',
    body: '• No hacked clients or unfair modifications.\n• No KillAura, Reach, Fly, Speed, X-Ray, AutoClicker, or similar cheats.\n• No macros, scripts, or anti-cheat bypasses.',
  },
  {
    id: 'section-3',
    emoji: '🐛',
    title: 'Exploits',
    body: '• No item, money, or resource duplication.\n• Do not abuse bugs or glitches.\n• Do not exploit shops, the economy, crates, quests, or rewards.\n• Report serious bugs and exploits to staff.\n• No lag machines or intentional server crashes.',
  },
  {
    id: 'section-4',
    emoji: '⚔️',
    title: 'PvP',
    body: '• PvP is allowed where it is enabled.\n• No combat logging or exploiting safe zones.\n• No glitches or bugs to gain an unfair PvP advantage.',
  },
  {
    id: 'section-5',
    emoji: '💰',
    title: 'Economy',
    body: '• No economy exploits or item/money duplication.\n• No abusing auction house or shop glitches.\n• Real-money trading is prohibited unless approved by N7 Forge.',
  },
  {
    id: 'section-6',
    emoji: '🎮',
    title: 'Gameplay',
    body: '• No inappropriate builds.\n• Avoid excessive farms or redstone systems that cause server lag.\n• Do not intentionally ruin or disrupt another player’s gameplay.',
  },
  {
    id: 'section-7',
    emoji: '👤',
    title: 'Accounts',
    body: '• No ban evasion.\n• Do not abuse alternate accounts for rewards, economy, events, or other advantages.\n• You are responsible for everything that happens on your account.',
  },
  {
    id: 'section-8',
    emoji: '📢',
    title: 'Advertising',
    body: '• No advertising other Minecraft servers or communities.\n• No malicious, harmful, or suspicious links.',
  },
  {
    id: 'section-9',
    emoji: '🛡️',
    title: 'Staff',
    body: '• Follow reasonable instructions given by staff.\n• Do not impersonate staff or intentionally waste staff members’ time.\n• Punishments may vary depending on the severity of the violation and the user’s punishment history.',
  },
];

const accentSwatches = ['#2B2D31', '#202225', '#313338', '#5865F2', '#7C5CFC'];

function hexToDiscordColor(hex: string) {
  return Number.parseInt(hex.replace('#', ''), 16);
}

function TextField({
  label,
  value,
  onChange,
  hint,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  testId: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      <input
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="editor-input"
      />
    </label>
  );
}

function SectionEditor({
  section,
  index,
  onChange,
}: {
  section: RuleSection;
  index: number;
  onChange: (next: RuleSection) => void;
}) {
  const [open, setOpen] = useState(index < 3);

  return (
    <div className={`rule-editor ${open ? 'is-open' : ''}`} data-testid={`card-rule-${section.id}`}>
      <button
        type="button"
        data-testid={`button-toggle-rule-${section.id}`}
        className="rule-editor-heading"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="rule-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="rule-heading-copy">
          <span className="rule-heading-title">{section.title || 'Untitled rule'}</span>
          <span className="rule-heading-meta">Embed field · {section.body.split('\n').filter(Boolean).length} lines</span>
        </span>
        <ChevronDown className={`rule-chevron ${open ? 'rotate-180' : ''}`} size={17} />
      </button>
      {open ? (
        <div className="rule-editor-body">
          <div className="grid gap-3 sm:grid-cols-[92px_1fr]">
            <label>
              <span className="field-label">Emoji</span>
              <input
                data-testid={`input-emoji-${section.id}`}
                value={section.emoji}
                maxLength={4}
                onChange={(event) => onChange({ ...section, emoji: event.target.value })}
                className="editor-input text-center text-lg"
              />
            </label>
            <label>
              <span className="field-label">Section name</span>
              <input
                data-testid={`input-section-name-${section.id}`}
                value={section.title}
                onChange={(event) => onChange({ ...section, title: event.target.value })}
                className="editor-input"
              />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="field-label">Rules</span>
            <span className="field-hint">One bullet per line. Your bullet styling is sent exactly as written.</span>
            <textarea
              data-testid={`textarea-rules-${section.id}`}
              value={section.body}
              onChange={(event) => onChange({ ...section, body: event.target.value })}
              className="editor-input min-h-[94px] resize-y leading-6"
              rows={3}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({
  configured,
  loading,
  error,
}: {
  configured?: boolean;
  loading: boolean;
  error: boolean;
}) {
  if (loading) {
    return (
      <span className="status-pill status-loading" data-testid="status-webhook-loading">
        <LoaderCircle className="animate-spin" size={13} /> Checking webhook
      </span>
    );
  }
  if (error) {
    return (
      <span className="status-pill status-error" data-testid="status-webhook-error">
        <AlertCircle size={13} /> Status unavailable
      </span>
    );
  }
  return (
    <span
      className={`status-pill ${configured ? 'status-ready' : 'status-error'}`}
      data-testid="status-webhook"
    >
      {configured ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
      {configured ? 'Webhook ready' : 'Webhook not configured'}
    </span>
  );
}

function Home() {
  const [title, setTitle] = useState('📜 N7 Forge — Server Rules');
  const [introduction, setIntroduction] = useState(
    'Welcome to N7 Forge!\n\nThese rules are here to keep the server fair, enjoyable, and welcoming for everyone.\n\nBy playing on or participating in N7 Forge, you agree to follow these rules. Staff may take action against behavior that violates the spirit of these rules, even if a specific situation is not listed word-for-word.\n\nIf you are unsure whether something is allowed, open a support ticket in <#1533548942497939712>.',
  );
  const [sections, setSections] = useState<RuleSection[]>(initialSections);
  const [supportMention, setSupportMention] = useState('<#1533548942497939712>');
  const [footer, setFooter] = useState('N7 Forge • Play fair. Respect others. Have fun.');
  const [accent, setAccent] = useState('#2B2D31');
  const [sendState, setSendState] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendMessage, setSendMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const webhookStatus = useGetWebhookStatus({
    query: { queryKey: getGetWebhookStatusQueryKey() },
  });
  const sendWebhook = useSendWebhook();
  const configured = webhookStatus.data?.configured === true;

  const description = useMemo(
    () => introduction.trim(),
    [introduction],
  );

  const updateSection = (next: RuleSection) => {
    setSections((current) => current.map((section) => (section.id === next.id ? next : section)));
    setSendState('idle');
  };

  const resetDraft = () => {
    setTitle('📜 N7 Forge — Server Rules');
    setIntroduction('Welcome to N7 Forge!\n\nThese rules are here to keep the server fair, enjoyable, and welcoming for everyone.\n\nBy playing on or participating in N7 Forge, you agree to follow these rules. Staff may take action against behavior that violates the spirit of these rules, even if a specific situation is not listed word-for-word.\n\nIf you are unsure whether something is allowed, open a support ticket in <#1533548942497939712>.');
    setSections(initialSections);
    setSupportMention('<#1533548942497939712>');
    setFooter('N7 Forge • Play fair. Respect others. Have fun.');
    setAccent('#2B2D31');
    setSendState('idle');
    setSendMessage('');
  };

  const handleSend = () => {
    setSendState('idle');
    setSendMessage('');
    sendWebhook.mutate(
      {
        data: {
          embed: {
            title: title.trim() || '📜 N7 Forge — Server Rules',
            description,
            color: hexToDiscordColor(accent),
            fields: sections
              .filter((section) => section.title.trim() && section.body.trim())
              .map((section) => ({
                name: `${section.emoji} ${section.title}`.trim(),
                value: section.body.trim(),
                inline: false,
              })),
            footer: footer.trim() ? { text: footer.trim() } : undefined,
          },
        },
      },
      {
        onSuccess: () => {
          setSendState('success');
          setSendMessage('Embed sent to Discord. Your rules are live.');
        },
        onError: () => {
          setSendState('error');
          setSendMessage('Discord did not accept the embed. Check the webhook configuration and try again.');
        },
      },
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
            <div className="brand-mark"><img src="/n7-forge-logo.gif" alt="N7 Forge" /></div>
          <div>
            <div className="brand-name">N7 FORGE</div>
            <div className="brand-product">WEBHOOK EDITOR</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="service-readout">
            <span className={`service-dot ${health.isError ? 'is-error' : health.isLoading ? 'is-loading' : ''}`} />
            <span data-testid="status-api">
              {health.isLoading ? 'Connecting to API' : health.isError ? 'API unavailable' : 'API connected'}
            </span>
          </div>
          <StatusPill
            configured={configured}
            loading={webhookStatus.isLoading}
            error={webhookStatus.isError}
          />
          <button type="button" onClick={() => setSettingsOpen((current) => !current)} className="icon-button" data-testid="button-settings" aria-label="Webhook settings" aria-expanded={settingsOpen}>
            <Settings2 size={17} />
          </button>
          {settingsOpen ? (
            <div className="settings-popover" data-testid="panel-settings">
              <strong>Server-side configuration</strong>
              <span>The Discord webhook URL is kept in the API server. This builder never reads it.</span>
              <button type="button" onClick={() => setSettingsOpen(false)} data-testid="button-close-settings">Close</button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="workspace">
        <section className="workspace-intro">
          <div>
            <div className="eyebrow"><Terminal size={14} /> SERVER OPERATIONS / COMPOSER</div>
            <h1>Make the rules<br /><em>impossible to miss.</em></h1>
            <p className="intro-copy">Compose a clean, unmistakably N7 Forge announcement and ship it straight to your Discord server.</p>
          </div>
          <div className="intro-actions">
            <button type="button" onClick={resetDraft} className="quiet-button" data-testid="button-reset-draft">
              <RefreshCcw size={15} /> Reset draft
            </button>
            <div className="draft-label"><span className="draft-dot" /> Draft in this session</div>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="editor-column" aria-label="Embed editor">
            <div className="panel editor-panel">
              <div className="panel-topline">
                <div>
                  <div className="panel-kicker">01 / MESSAGE FRAME</div>
                  <h2>Set the tone</h2>
                </div>
                <Code2 className="panel-icon" size={20} />
              </div>
              <div className="field-stack">
                <TextField label="Embed title" hint="The first thing players see" value={title} onChange={(value) => { setTitle(value); setSendState('idle'); }} testId="input-embed-title" />
                <label className="block">
                  <span className="field-label">Introduction</span>
                  <span className="field-hint">Short, warm context before the rules</span>
                  <textarea data-testid="textarea-introduction" value={introduction} onChange={(event) => { setIntroduction(event.target.value); setSendState('idle'); }} className="editor-input min-h-[94px] resize-y leading-6" rows={3} />
                </label>
              </div>
            </div>

            <div className="panel editor-panel">
              <div className="panel-topline">
                <div>
                  <div className="panel-kicker">02 / RULE SET</div>
                  <h2>Build your rule sections</h2>
                </div>
                <ShieldCheck className="panel-icon" size={20} />
              </div>
              <p className="panel-description">Use one field per rule group. Discord allows up to 25 fields; this layout is tuned for a phone screen.</p>
              <div className="rules-list">
                {sections.map((section, index) => (
                  <SectionEditor key={section.id} section={section} index={index} onChange={updateSection} />
                ))}
              </div>
            </div>

            <div className="panel editor-panel">
              <div className="panel-topline">
                <div>
                  <div className="panel-kicker">03 / FINISHING DETAILS</div>
                  <h2>Leave a clear trail</h2>
                </div>
                <HeartHandshake className="panel-icon" size={20} />
              </div>
              <div className="field-stack">
                <label className="block">
                  <span className="field-label">Support channel mention</span>
                  <span className="field-hint">Shown inside the introduction and embed mention</span>
                  <div className="input-with-icon">
                    <Hash size={16} />
                    <input data-testid="input-support-mention" value={supportMention} onChange={(event) => setSupportMention(event.target.value)} className="editor-input pl-9" />
                  </div>
                </label>
                <TextField label="Footer" value={footer} onChange={setFooter} hint="A compact sign-off under the embed" testId="input-footer" />
                <div>
                  <span className="field-label">Accent color</span>
                  <span className="field-hint">Use neutral gray for the reference style</span>
                  <div className="color-row">
                    <input data-testid="input-accent-color" type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="color-picker" aria-label="Accent color" />
                    <div className="swatches">
                      {accentSwatches.map((swatch) => (
                        <button key={swatch} type="button" data-testid={`button-accent-${swatch.slice(1)}`} className={`swatch ${accent.toLowerCase() === swatch.toLowerCase() ? 'selected' : ''}`} style={{ backgroundColor: swatch }} onClick={() => setAccent(swatch)} aria-label={`Use ${swatch} accent`} />
                      ))}
                    </div>
                    <span className="hex-value">{accent.toUpperCase()}</span>
                    <Palette size={15} className="ml-auto text-[hsl(var(--muted-foreground))]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="preview-column" aria-label="Live Discord preview">
            <div className="preview-sticky">
              <div className="preview-heading">
                <div>
                  <div className="panel-kicker">LIVE OUTPUT</div>
                  <h2>Discord preview</h2>
                </div>
                <div className="preview-live"><span /> LIVE</div>
              </div>
              <div className="phone-frame">
                <div className="phone-speaker" />
                <div className="discord-screen">
                  <div className="discord-statusbar"><span>9:41</span><span className="statusbar-icons">◒ ▮</span></div>
                  <div className="discord-channelbar"><ChevronDown size={15} /><strong>rules</strong><span className="channel-actions"><Bell size={15} /><Users size={15} /></span></div>
                  <div className="discord-messages">
                    <div className="discord-date">TODAY AT 09:41</div>
                    <div className="discord-message">
                      <div className="discord-avatar"><img src="/n7-forge-logo.gif" alt="" /></div>
                      <div className="discord-message-body">
                        <div className="discord-author">N7 Forge <span className="bot-tag">BOT</span> <span className="discord-time">Today at 09:41</span></div>
                        <div className="discord-embed" data-testid="preview-embed" style={{ borderLeftColor: accent }}>
                          <div className="discord-embed-title" data-testid="preview-embed-title">{title || 'Untitled embed'}</div>
                          <div className="discord-embed-description" data-testid="preview-embed-description">{description || 'Your introduction will appear here.'}</div>
                          <div className="discord-embed-fields">
                            {sections.map((section) => (
                              <div className="discord-field" key={section.id}>
                                <div className="discord-field-name">{section.emoji} {section.title || 'Untitled section'}</div>
                                <div className="discord-field-value">{section.body || 'Add a rule for this section.'}</div>
                              </div>
                            ))}
                          </div>
                          <div className="discord-footer">{footer || 'Add a footer'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="discord-composer"><span>Message #rules</span><span>＋　GIF　☺</span></div>
                </div>
              </div>
              <div className="preview-caption"><Eye size={14} /> This is how your embed will read on mobile.</div>
              <div className="send-card">
                <div className="send-card-top">
                  <div className="send-icon"><Send size={17} /></div>
                  <div>
                    <strong>Ready to publish?</strong>
                    <span>{configured ? 'Your server webhook is configured.' : 'Connect a webhook to send this embed.'}</span>
                  </div>
                </div>
                {sendState !== 'idle' ? (
                  <div className={`send-feedback ${sendState === 'success' ? 'is-success' : 'is-error'}`} data-testid={`status-send-${sendState}`}>
                    {sendState === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{sendMessage}</span>
                    <button type="button" onClick={() => setSendState('idle')} aria-label="Dismiss send feedback" data-testid="button-dismiss-feedback"><X size={14} /></button>
                  </div>
                ) : null}
                <button type="button" data-testid="button-send-webhook" onClick={handleSend} disabled={!configured || sendWebhook.isPending || webhookStatus.isLoading} className="send-button">
                  {sendWebhook.isPending ? <><LoaderCircle className="animate-spin" size={16} /> Sending to Discord</> : <><Send size={16} /> Send to Discord</>}
                </button>
                <div className="send-note"><LockKeyhole size={12} /> Sent through your server-side webhook · never exposed in browser</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <span><Sparkles size={13} /> N7 Forge operations console</span>
        <span>Webhook Builder <b>·</b> v1.0</span>
        <span className="footer-help"><CircleHelp size={13} /> Need help? <ExternalLink size={12} /></span>
      </footer>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
