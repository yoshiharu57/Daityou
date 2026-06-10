"""サンプルデータの投入スクリプト"""
from database import SessionLocal, engine
import models
from datetime import date

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

sample_bridges = [
    {
        "management_number": "BR-001",
        "bridge_name": "大川橋",
        "bridge_name_kana": "オオカワバシ",
        "road_name": "市道第1号線",
        "location": "〇〇市中央区大川町1丁目",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "bridge_length": 45.5,
        "width": 8.5,
        "structure_type": "RC単純T桁橋",
        "superstructure_type": "RC桁橋",
        "substructure_type": "逆T式橋台",
        "material": "鉄筋コンクリート",
        "year_built": 1985,
        "road_class": "市道",
        "administrator": "〇〇市土木課",
    },
    {
        "management_number": "BR-002",
        "bridge_name": "新緑橋",
        "bridge_name_kana": "シンリョクバシ",
        "road_name": "主要地方道15号",
        "location": "〇〇市北区桜町2丁目",
        "latitude": 35.6895,
        "longitude": 139.6917,
        "bridge_length": 28.0,
        "width": 10.0,
        "structure_type": "PC単純桁橋",
        "superstructure_type": "PC桁橋",
        "substructure_type": "壁式橋脚",
        "material": "プレストレストコンクリート",
        "year_built": 1998,
        "road_class": "主要地方道",
        "administrator": "〇〇市土木課",
    },
    {
        "management_number": "BR-003",
        "bridge_name": "西山歩道橋",
        "bridge_name_kana": "ニシヤマホドウキョウ",
        "road_name": "市道第22号線",
        "location": "〇〇市西区山手町",
        "latitude": 35.6628,
        "longitude": 139.6312,
        "bridge_length": 15.2,
        "width": 3.5,
        "structure_type": "鋼単純桁橋",
        "superstructure_type": "鋼桁橋",
        "substructure_type": "重力式橋台",
        "material": "鋼",
        "year_built": 1972,
        "road_class": "市道",
        "administrator": "〇〇市土木課",
    },
    {
        "management_number": "BR-004",
        "bridge_name": "桜並木橋",
        "bridge_name_kana": "サクラナミキバシ",
        "road_name": "町道第5号線",
        "location": "〇〇市南区桜ヶ丘3丁目",
        "latitude": 35.6510,
        "longitude": 139.6745,
        "bridge_length": 22.0,
        "width": 7.0,
        "structure_type": "RC床版橋",
        "superstructure_type": "RC床版橋",
        "substructure_type": "ボックス式橋台",
        "material": "鉄筋コンクリート",
        "year_built": 1991,
        "road_class": "町道",
        "administrator": "〇〇市道路管理課",
    },
]

for bridge_data in sample_bridges:
    existing = db.query(models.Bridge).filter(
        models.Bridge.management_number == bridge_data["management_number"]
    ).first()
    if not existing:
        db.add(models.Bridge(**bridge_data))

db.commit()

bridges = db.query(models.Bridge).all()
bridge_map = {b.management_number: b for b in bridges}

sample_inspections = [
    {
        "bridge_id": bridge_map["BR-001"].id,
        "inspection_date": date(2024, 6, 15),
        "inspection_type": "定期点検",
        "inspector_company": "〇〇建設コンサルタント",
        "inspector_name": "田中 一郎",
        "health_rating": "II",
        "overall_findings": "床版に軽微なひび割れが確認された。主桁に錆が発生しているが進行は緩慢。",
        "repair_urgency": "次回点検まで経過観察",
        "next_inspection_date": date(2029, 6, 1),
    },
    {
        "bridge_id": bridge_map["BR-002"].id,
        "inspection_date": date(2023, 10, 5),
        "inspection_type": "定期点検",
        "inspector_company": "△△技術研究所",
        "inspector_name": "佐藤 花子",
        "health_rating": "I",
        "overall_findings": "全体的に良好な状態を維持している。",
        "repair_urgency": "なし",
        "next_inspection_date": date(2028, 10, 1),
    },
    {
        "bridge_id": bridge_map["BR-003"].id,
        "inspection_date": date(2022, 5, 20),
        "inspection_type": "定期点検",
        "inspector_company": "〇〇建設コンサルタント",
        "inspector_name": "鈴木 次郎",
        "health_rating": "III",
        "overall_findings": "主桁に著しい腐食が確認された。早期の補修が必要。",
        "repair_urgency": "早急に補修が必要",
        "next_inspection_date": date(2027, 5, 1),
    },
    {
        "bridge_id": bridge_map["BR-004"].id,
        "inspection_date": date(2025, 3, 10),
        "inspection_type": "定期点検",
        "inspector_company": "△△技術研究所",
        "inspector_name": "山田 三郎",
        "health_rating": "II",
        "overall_findings": "支承部に軽微な錆が見られる。床版に0.2mm以下のひび割れあり。",
        "repair_urgency": "次回点検時に再確認",
        "next_inspection_date": date(2030, 3, 1),
    },
]

for insp_data in sample_inspections:
    existing = db.query(models.Inspection).filter(
        models.Inspection.bridge_id == insp_data["bridge_id"],
        models.Inspection.inspection_date == insp_data["inspection_date"]
    ).first()
    if not existing:
        db.add(models.Inspection(**insp_data))

db.commit()
db.close()
print("サンプルデータを登録しました。")
