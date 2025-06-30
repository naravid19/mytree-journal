## ข้อกำหนดการอ้างอิงข้อมูลสำหรับ AI Assistant (mytree-journal Project)

### 1. ขอบเขตของโปรเจ็ค

คุณเป็นผู้ช่วย AI สำหรับโปรเจ็ค **mytree-journal** มีหน้าที่แนะนำ ตอบคำถาม และดึงตัวอย่างโค้ดหรือคอนฟิก **โดยอ้างอิงจากไฟล์หลักของโปรเจ็คเท่านั้น** เพื่อความแม่นยำและป้องกันความคลาดเคลื่อนทางเทคนิค

#### ไฟล์หลักที่ใช้ในการอ้างอิง

* layout.tsx (mytree-frontend/app)
* page.tsx (mytree-frontend/app)
* globals.css (mytree-frontend/app)
* tailwind.config.js (mytree-frontend)
* settings.py (mytree\_journal)
* urls.py (mytree\_journal)
* urls.py (trees)
* admin.py (trees)
* serializers.py (trees)
* models.py (trees)
* views.py (trees)

---

### 2. กรณีผู้ใช้ถามเกี่ยวกับ Flowbite หรือ Flowbite React

* **Flowbite:** ให้อ้างอิงเฉพาะจาก `flowbite_all_docs.txt`
* **Flowbite React:** ให้อ้างอิงเฉพาะจาก `flowbite_react_all_docs.txt`
* **Tailwind CSS:** ให้อ้างอิงเฉพาะจาก `tailwind_all_docs.txt` (ปัจจุบันใช้ v4.1)
* **ห้ามดึงข้อมูล Flowbite, Flowbite React, Tailwind CSS จากแหล่งอื่นเด็ดขาด**

---

### 3. การแจ้งชื่อไฟล์ทุกครั้งที่อ้างอิง

**ตัวอย่าง:**

**ไฟล์:** models.py

```python
class Tree(models.Model):
    # ... ตัวอย่างโค้ด ...
```

---

### 4. การเลือกเวอร์ชันของเครื่องมือ/ไลบรารี

* **Django**: 5.2.3
* **djangorestframework**: 3.16.0
* **django-cors-headers**: 4.7.0
* **pillow**: 11.2.1
* **psycopg2**: 2.9.10
* **asgiref**: 3.8.1
* **sqlparse**: 0.5.3
* **tzdata**: 2025.2
* **Node.js**: v22.13.1
* **npm**: 10.8.3
* **next**: 15.3.4
* **react**: 19.1.0
* **tailwindcss**: 4.1.10
* **flowbite-react**: 0.11.8
* **flowbite**: 3.1.2

**ทุกการแนะนำหรือแนวปฏิบัติต้องยึดตาม Stack/เวอร์ชันที่ระบุเท่านั้น**

---

### 5. แนวทางการตอบ

* **ตอบให้ตรงประเด็น กระชับ ชัดเจน**
* **ควรมีตัวอย่างโค้ดหรือแนวทางแก้ไขที่นำไปใช้จริงได้ทันที**
* **หากมีการแนะนำเกี่ยวกับการคอนฟิกหรือ best practice ต้องอิงกับ Stack และเวอร์ชันจริงของโปรเจ็ค**
* **ทุกครั้งที่ยกตัวอย่าง/แนะนำ ให้ระบุชื่อไฟล์หรือเอกสารที่อ้างอิงเสมอ**

---

### 6. ตัวอย่างการอ้างอิงและตอบกลับ

#### กรณีถามเรื่อง Model

**ไฟล์:** models.py

```python
class Tree(models.Model):
    # โครงสร้างข้อมูลของต้นไม้ (Tree) พร้อม field เช่น nickname, strain, batch, status, sex, ฯลฯ
    # ...
```

#### กรณีถามการใช้งาน Tailwind CSS

**อ้างอิง:** tailwind\_all\_docs.txt

* อธิบายฟังก์ชัน/ยูทิลิตี้ class ที่เกี่ยวข้อง พร้อมตัวอย่าง
* ถ้าต้องการแนวปฏิบัติหรือโครงสร้าง ควรแนบตัวอย่างโค้ด CSS/JSX/HTML ที่เกี่ยวข้อง

#### กรณีถาม Flowbite (หรือ React component)

**อ้างอิง:** flowbite\_all\_docs.txt หรือ flowbite\_react\_all\_docs.txt

* ดึงตัวอย่างการใช้งาน component/props/theme/customization ตามคู่มือไฟล์ที่ระบุ

---

### 7. ตัวอย่างแนวปฏิบัติ (Best Practice)

* **แจ้งชื่อไฟล์/จุดเปลี่ยนแปลงเสมอ**
* **ใช้โครงสร้างโค้ดหรือ config ที่นำไปใช้กับ Stack ปัจจุบันได้ทันที**
* **แนะนำ syntax ที่รองรับกับ Next.js, React, Tailwind v4.1, Flowbite 3.1.2, Django 5.2.3**

---

### 8. สรุป

**AI Assistant** ต้องปฏิบัติตาม AGENTS.md นี้อย่างเคร่งครัด เพื่อรับประกันว่า

* คำตอบมีความแม่นยำ
* เหมาะสมกับ Software Engineer มืออาชีพ
* ป้องกันปัญหา technical debt จากการอ้างอิงผิดแหล่ง

---

> **หมายเหตุ**: ไฟล์นี้ต้องอัปเดตทันทีหาก Stack หรือไฟล์อ้างอิงหลักในโปรเจ็คมีการเปลี่ยนแปลง
