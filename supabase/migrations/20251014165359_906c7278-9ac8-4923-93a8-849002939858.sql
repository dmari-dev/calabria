-- Cancella tutti gli itinerari esistenti
DELETE FROM platform_itineraries;

-- Inserisci itinerari per la Calabria
INSERT INTO platform_itineraries (
  created_by,
  title,
  destination,
  start_date,
  end_date,
  participants_count,
  participants_type,
  travel_pace,
  specific_interests,
  is_published,
  ai_content
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  'Calabria Antica: Tra Greci e Bizantini',
  'Calabria',
  CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '35 days',
  2,
  'couple',
  'moderate',
  'archeologia, storia antica, architettura bizantina',
  true,
  '{
    "summary": "Un viaggio nella Calabria antica, alla scoperta delle testimonianze della Magna Grecia e dell''epoca bizantina. Esploreremo siti archeologici, chiese bizantine e borghi storici.",
    "days": [
      {
        "day": 1,
        "title": "Reggio Calabria e i Bronzi di Riace",
        "activities": [
          {"time": "09:00", "title": "Museo Archeologico Nazionale", "description": "Visita ai famosi Bronzi di Riace", "duration": "3 ore", "cost": "€8"},
          {"time": "14:00", "title": "Lungomare Falcomatà", "description": "Passeggiata sul lungomare più bello d''Italia", "duration": "2 ore", "cost": "Gratis"},
          {"time": "17:00", "title": "Centro storico", "description": "Esplorazione del centro e della cattedrale", "duration": "2 ore", "cost": "Gratis"}
        ]
      },
      {
        "day": 2,
        "title": "Gerace e Locri Epizefiri",
        "activities": [
          {"time": "10:00", "title": "Borgo di Gerace", "description": "Visita al borgo medievale e alla cattedrale normanna", "duration": "3 ore", "cost": "€5"},
          {"time": "15:00", "title": "Parco Archeologico di Locri", "description": "Antica città della Magna Grecia", "duration": "2.5 ore", "cost": "€6"}
        ]
      }
    ]
  }'::jsonb
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Aspromonte: Natura e Tradizioni',
  'Calabria',
  CURRENT_DATE + INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '48 days',
  4,
  'family',
  'relaxed',
  'natura, escursionismo, tradizioni locali',
  true,
  '{
    "summary": "Alla scoperta del Parco Nazionale dell''Aspromonte, tra boschi secolari, cascate e antiche tradizioni grecaniche.",
    "days": [
      {
        "day": 1,
        "title": "Pentedattilo e i borghi fantasma",
        "activities": [
          {"time": "10:00", "title": "Borgo di Pentedattilo", "description": "Visita al suggestivo borgo abbandonato", "duration": "2 ore", "cost": "Gratis"},
          {"time": "14:00", "title": "Bova", "description": "Capitale della cultura grecanica", "duration": "2.5 ore", "cost": "€4"}
        ]
      },
      {
        "day": 2,
        "title": "Cascate e natura",
        "activities": [
          {"time": "09:00", "title": "Cascate Amendolea", "description": "Trekking alle cascate", "duration": "4 ore", "cost": "€10"},
          {"time": "15:00", "title": "Gallicianò", "description": "Villaggio grecanico autentico", "duration": "2 ore", "cost": "Gratis"}
        ]
      }
    ]
  }'::jsonb
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Sila: Il Cuore Verde della Calabria',
  'Calabria',
  CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '63 days',
  2,
  'couple',
  'moderate',
  'natura, laghi, parchi nazionali',
  true,
  '{
    "summary": "Immersione nel Parco Nazionale della Sila, tra laghi cristallini, foreste di pini larici e paesaggi montani mozzafiato.",
    "days": [
      {
        "day": 1,
        "title": "Lago Arvo e Lorica",
        "activities": [
          {"time": "10:00", "title": "Lago Arvo", "description": "Escursione panoramica attorno al lago", "duration": "3 ore", "cost": "Gratis"},
          {"time": "15:00", "title": "Centro storico di Lorica", "description": "Visita al borgo montano", "duration": "2 ore", "cost": "Gratis"}
        ]
      },
      {
        "day": 2,
        "title": "Camigliatello e i Giganti della Sila",
        "activities": [
          {"time": "09:30", "title": "Riserva dei Giganti della Sila", "description": "Passeggiata tra alberi secolari", "duration": "2.5 ore", "cost": "€5"},
          {"time": "14:00", "title": "Museo del Lupo", "description": "Centro visite del Parco Nazionale", "duration": "1.5 ore", "cost": "€3"}
        ]
      }
    ]
  }'::jsonb
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Cosenza: Arte e Cultura nel Cuore della Calabria',
  'Calabria',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '23 days',
  3,
  'friends',
  'active',
  'arte, musei, centro storico',
  true,
  '{
    "summary": "Viaggio culturale a Cosenza e dintorni, tra musei d''arte contemporanea, centri storici medievali e testimonianze artistiche.",
    "days": [
      {
        "day": 1,
        "title": "Cosenza città d''arte",
        "activities": [
          {"time": "09:00", "title": "Centro storico di Cosenza", "description": "Visita al Duomo e al castello normanno-svevo", "duration": "3 ore", "cost": "€6"},
          {"time": "14:00", "title": "Corso Mazzini", "description": "Shopping e architettura Liberty", "duration": "2 ore", "cost": "Gratis"},
          {"time": "17:00", "title": "MAB - Museo all''Aperto Bilotti", "description": "Sculture di artisti contemporanei", "duration": "1.5 ore", "cost": "Gratis"}
        ]
      },
      {
        "day": 2,
        "title": "Rende e Montalto Uffugo",
        "activities": [
          {"time": "10:00", "title": "Museo Nazionale Archeologico", "description": "Collezioni dalla preistoria al medioevo", "duration": "2 ore", "cost": "€5"},
          {"time": "15:00", "title": "Centro storico di Montalto", "description": "Borgo medievale e chiese antiche", "duration": "2.5 ore", "cost": "Gratis"}
        ]
      }
    ]
  }'::jsonb
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Tropea e la Costa degli Dei',
  'Calabria',
  CURRENT_DATE + INTERVAL '50 days',
  CURRENT_DATE + INTERVAL '54 days',
  2,
  'couple',
  'relaxed',
  'mare, spiagge, centri storici',
  true,
  '{
    "summary": "Relax e cultura sulla splendida Costa degli Dei, tra spiagge da sogno, borghi marinari e panorami mozzafiato.",
    "days": [
      {
        "day": 1,
        "title": "Tropea la perla del Tirreno",
        "activities": [
          {"time": "10:00", "title": "Centro storico di Tropea", "description": "Visita al centro e alla Cattedrale", "duration": "2 ore", "cost": "€3"},
          {"time": "12:30", "title": "Santuario di Santa Maria dell''Isola", "description": "Monastero su uno scoglio", "duration": "1.5 ore", "cost": "€2"},
          {"time": "15:00", "title": "Spiaggia e mare", "description": "Relax sulle spiagge bianche", "duration": "3 ore", "cost": "Gratis"}
        ]
      },
      {
        "day": 2,
        "title": "Capo Vaticano e Pizzo",
        "activities": [
          {"time": "09:00", "title": "Capo Vaticano", "description": "Escursione e bagno nelle calette", "duration": "4 ore", "cost": "Gratis"},
          {"time": "15:00", "title": "Pizzo Calabro", "description": "Centro storico e degustazione del tartufo", "duration": "2.5 ore", "cost": "€8"}
        ]
      }
    ]
  }'::jsonb
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Catanzaro e la Valle dei Mulini',
  'Calabria',
  CURRENT_DATE + INTERVAL '40 days',
  CURRENT_DATE + INTERVAL '42 days',
  2,
  'couple',
  'moderate',
  'storia, natura urbana, artigianato',
  true,
  '{
    "summary": "Scoperta di Catanzaro, città della seta, e della sua suggestiva valle dei mulini, tra storia artigiana e natura.",
    "days": [
      {
        "day": 1,
        "title": "Catanzaro centro",
        "activities": [
          {"time": "10:00", "title": "Parco della Biodiversità", "description": "Giardini e museo MUSMI", "duration": "2 ore", "cost": "€5"},
          {"time": "14:00", "title": "Centro storico", "description": "Chiese barocche e vie dell''artigianato", "duration": "2.5 ore", "cost": "Gratis"},
          {"time": "17:00", "title": "Ponte Bisantis", "description": "Ponte ad arco unico e panorama", "duration": "1 ore", "cost": "Gratis"}
        ]
      },
      {
        "day": 2,
        "title": "Valle dei Mulini e dintorni",
        "activities": [
          {"time": "09:00", "title": "Parco della Fiumarella", "description": "Trekking nella valle storica", "duration": "3 ore", "cost": "Gratis"},
          {"time": "15:00", "title": "Museo della Seta", "description": "Storia della tradizione serica", "duration": "2 ore", "cost": "€4"}
        ]
      }
    ]
  }'::jsonb
);