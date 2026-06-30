from database import SessionLocal, engine
import models
from datetime import date

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

if db.query(models.Project).count() > 0:
    print("既にデータが存在します")
    db.close()
    exit()

projects = [
    models.Project(
        business_number="R6-001",
        project_name="○○川橋梁詳細設計業務",
        client_organization="○○県土木部",
        client_contact="田中 一郎",
        contract_date=date(2024, 4, 1),
        start_date=date(2024, 4, 1),
        end_date=date(2025, 3, 31),
        contract_amount=8500000,
        project_type="橋梁設計",
        person_in_charge="山田 太郎",
        chief_engineer="鈴木 健一",
        review_engineer="佐藤 雄二",
        progress_rate=85,
        status="進行中",
        notes="年度末納品予定。中間報告書提出済み。",
    ),
    models.Project(
        business_number="R6-002",
        project_name="△△道路改良設計委託",
        client_organization="△△市建設局",
        client_contact="中村 花子",
        contract_date=date(2024, 5, 15),
        start_date=date(2024, 6, 1),
        end_date=date(2024, 11, 30),
        contract_amount=3200000,
        project_type="道路設計",
        person_in_charge="伊藤 次郎",
        chief_engineer="山田 太郎",
        review_engineer="鈴木 健一",
        progress_rate=100,
        status="完了",
        notes="納品完了。検収待ち。",
    ),
    models.Project(
        business_number="R6-003",
        project_name="□□地区治水計画策定業務",
        client_organization="□□県河川課",
        client_contact="高橋 誠",
        contract_date=date(2024, 7, 1),
        start_date=date(2024, 7, 1),
        end_date=date(2025, 6, 30),
        contract_amount=12000000,
        project_type="河川・治水",
        person_in_charge="鈴木 健一",
        chief_engineer="佐藤 雄二",
        review_engineer="山田 太郎",
        progress_rate=40,
        status="進行中",
        notes="現地調査フェーズ完了。解析作業中。",
    ),
    models.Project(
        business_number="R6-004",
        project_name="◇◇港湾施設点検業務",
        client_organization="◇◇港湾局",
        client_contact="渡辺 幸子",
        contract_date=date(2024, 8, 1),
        start_date=date(2024, 9, 1),
        end_date=date(2025, 2, 28),
        contract_amount=5600000,
        project_type="港湾・海岸",
        person_in_charge="佐藤 雄二",
        chief_engineer="伊藤 次郎",
        review_engineer="鈴木 健一",
        progress_rate=60,
        status="進行中",
        notes="第1回点検完了。報告書作成中。",
    ),
    models.Project(
        business_number="R6-005",
        project_name="★★トンネル維持管理計画",
        client_organization="★★道路公社",
        client_contact="小林 健太",
        contract_date=date(2024, 10, 1),
        start_date=date(2024, 10, 15),
        end_date=date(2025, 1, 31),
        contract_amount=4100000,
        project_type="トンネル",
        person_in_charge="山田 太郎",
        chief_engineer="鈴木 健一",
        review_engineer="佐藤 雄二",
        progress_rate=30,
        status="進行中",
        notes="現地調査準備中。",
    ),
]

db.add_all(projects)
db.commit()

logs = [
    models.ActivityLog(
        project_id=1,
        log_date=date(2024, 12, 10),
        activity_type="打合せ",
        description="中間報告会を実施。発注者より追加検討の指示あり。",
        staff_name="山田 太郎",
        next_action="追加検討資料を1月末までに提出",
    ),
    models.ActivityLog(
        project_id=1,
        log_date=date(2024, 11, 20),
        activity_type="提出",
        description="中間報告書（第1回）提出。",
        staff_name="山田 太郎",
        next_action="発注者確認後、第2回打合せ日程調整",
    ),
    models.ActivityLog(
        project_id=3,
        log_date=date(2024, 12, 5),
        activity_type="現地調査",
        description="現地踏査・測量完了。データ整理中。",
        staff_name="鈴木 健一",
        next_action="解析モデル構築",
    ),
]

db.add_all(logs)
db.commit()
db.close()
print("サンプルデータを投入しました")
