# Bybilder: prompts til ChatGPT

Hamar-bildet fra startpakken er malen. Lag de andre byene i samme stil, så de henger sammen.

## Slik gjør du det
1. Lim inn **stilblokken** først, og deretter teksten for én by. Lag gjerne alle i samme ChatGPT-samtale, så holder stilen seg lik.
2. Be om **liggende 16:9**, minst 1600 px bredt.
3. Lagre som `src/assets/cities/<id>.jpg` (for eksempel `oslo.jpg`). Spillet plukker det opp automatisk.
4. Bildet beskjæres til et bredt bånd (omtrent 2,2:1) rundt midten. Hold det viktigste i den midtre delen av bildet.

## Stilblokk (lim inn først hver gang)

> Filmatisk, fotorealistisk konseptbilde av en ekte norsk by, sett skrått ovenfra som fra en drone i lav høyde. Skumring eller blå time, med varme gatelys og opplyste vinduer mot en mørkere himmel med farger i skyene. Stemning som en moderne filmscene: rik, men dempet fargepalett, lett dis, høy detaljgrad. Geografisk troverdig: bruk byens ekte landemerker og plasser dem riktig, ikke finn opp bygninger. Ingen tekst, ingen logoer, ingen UI-elementer, ingen vannmerker, ingen mennesker i forgrunnen. Liggende format 16:9.

## Byene

| id | By | Motiv |
|---|---|---|
| `oslo` | Oslo | Bjørvika fra fjorden: Operahuset i forgrunnen, Munchmuseet og Barcode-rekka bak, lys fra byen som speiler seg i Oslofjorden. Høstkveld. |
| `bergen` | Bergen | Vågen og Bryggen med de fargerike trehusene, Fløyen og fjellsidene bak med lys. Regn og våte brosteiner som reflekterer lyset, lavt skydekke. |
| `trondheim` | Trondheim | Nidelva med de fargerike bryggene på Bakklandet og Gamle Bybro, Nidarosdomen synlig i bakgrunnen. Tidlig vinterkveld, lett snø på takene. |
| `stavanger` | Stavanger | Vågen med båter og sjøhus, Gamle Stavanger med hvite trehus på skråningen. Klar kveld, rolig sjø, et oljeskip langt ute i horisonten. |
| `tromso` | Tromsø | Tromsøbrua over sundet med Ishavskatedralen på fastlandssiden, snødekte fjell, grønt nordlys over himmelen. Polarnatt. |
| `kristiansand` | Kristiansand | Havna med Fiskebrygga og Kilden teater- og konserthus ved vannet, en Danmarksferge på vei inn. Lys sommerkveld, rolig sjø. |
| `bodo` | Bodø | Havna og sentrum med kulturhuset Stormen ved vannet, Børvasstindan med snø i bakgrunnen. Skumring med kaldt, klart lys. |
| `alesund` | Ålesund | Jugendbyen sett fra Aksla: Brosundet, de tettpakkede jugendhusene, øyene og havet utenfor, fjell i bakgrunnen. Blå time. |

## Tekst til hver by
Lim inn stilblokken, og deretter: *«By: Oslo. Motiv: …»* med teksten fra tabellen.

Er det et landemerke som ser feil ut eller ligger på feil sted, be ChatGPT rette det, eller ta ut landemerket.
