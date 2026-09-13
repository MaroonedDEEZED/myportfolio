import os

images = [
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235623/20240819_002314.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235623/20240819_002329.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235622/20240819_002320.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235622/20240321_191038.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235621/6.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235621/PH15.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235620/PH13.png',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235620/PH14.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235620/PH12.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235619/PH11.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235619/PH10.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235612/PH9.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235611/PH7.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235611/PH2.png',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235611/PH8.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235611/PH6.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235611/PH3.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/20240819_002335.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/PH5.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/PH4.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/20250531_191150.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/PH1.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235610/20240819_002613.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235609/20240819_002528_In.jpg',
'https://res.cloudinary.com/zsyvfq70/image/upload/v1789235609/20240819_002346.jpg',
]

videos = [
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235922/Editorial_video_2_Female__Frames.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235920/Hamoud_boualem_ad_3.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235920/model_1_video_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235910/BEAT_TEASER_1_FINAL_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235910/Car_wrap_defender.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235906/Frames_v03.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235904/Gharrafa_Stat_Ad.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235903/model_2_video_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235892/Editorial_video_6__Male___Frames.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235891/Store_Highlight_V1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235889/MOGOBOGO_reel_v2.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235883/Barber_Bay_V2.1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235869/FsRT_Video.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235868/Horati_Sahlep.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235867/Frames_Brett.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235865/Night_vibes_with_Football__Ottoman.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235861/The_Closet_-_Chic_.mov',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235861/FANCY_SPEED_RAMP_12__1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235859/crosswalk.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235839/the_closet_factory.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235837/ottoman_mw.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235835/IMG_2517.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235833/This_is_Ottoman.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789235831/Video_Idea_4.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789333966/Cq1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338224/Ram_Vibes_2_v2_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338227/Coffee_and_Sweet_V3_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338235/Hamoud_boualem_ad_2_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338239/Top_Sports_Match_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338247/FTV_8.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338251/Hamoud_boualem_Ad_1_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338251/Clements_Work_Process-.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338252/Djezzy_Commercial_1_1.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338259/OMO_ad-.mp4',
'https://res.cloudinary.com/zsyvfq70/video/upload/v1789338266/AMNM_QND_V1-1_1.mp4',
]

all_assets = []
for url in images:
    all_assets.append({
        'kind': 'photo',
        'url': url,
    })

for url in videos:
    all_assets.append({
        'kind': 'video',
        'url': url,
    })

# perfect mixed order: alternate image/video in the sequence as requested
mixed = []
for i in range(max(len(images), len(videos))):
    if i < len(images):
        mixed.append({ 'kind': 'photo', 'url': images[i] })
    if i < len(videos):
        mixed.append({ 'kind': 'video', 'url': videos[i] })

# fallback if mismatch list count
if len(mixed) < len(all_assets):
    mixed = all_assets

rows = []
for idx, asset in enumerate(mixed):
    url = asset['url']
    kind = asset['kind']
    title = os.path.basename(url)
    title = os.path.splitext(title)[0]
    title = title.replace('_', ' ')
    title = title.replace('-', ' ')

    row = "{ title: '" + title.replace("'", "\\'") + "',"
    row += " kind: '" + kind + "',"
    row += " year: '2025',"
    row += " location: 'Portfolio',"
    row += " summary: 'Portfolio work',"
    row += " asset: '" + url.replace("'", "\\'") + "',"
    if kind == 'video':
        public_id = os.path.splitext(os.path.basename(url))[0]
        row += " poster: 'https://res.cloudinary.com/zsyvfq70/video/upload/h_250,q_auto/" + public_id + ".jpg',"
    row += " },"
    rows.append(row)

out = "export type PortfolioKind = 'photo' | 'video';\n"
out += "export type PortfolioAsset = { title: string; kind: PortfolioKind; year: string; location: string; summary: string; asset: string; poster?: string; };\n"
out += "export const portfolioAssets: PortfolioAsset[] = [\n"
out += "\n".join("  " + r for r in rows)
out += "\n];\n"

with open('client/src/portfolioAssets.ts', 'w', encoding='utf-8') as f:
    f.write(out)

print('assets:', len(mixed), 'images:', len(images), 'videos:', len(videos))
