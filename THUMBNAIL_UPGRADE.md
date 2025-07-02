# การปรับปรุงการใช้ Thumbnail และปุ่มดูภาพต้นฉบับ

## การเปลี่ยนแปลงที่ทำ

### 1. อัปเดต Type Definition
```typescript
type Image = {
  id: number;
  image: string;
  thumbnail: string;  // เพิ่ม thumbnail field
  uploaded_at: string;
};
```

### 2. การใช้ Thumbnail ในทุกส่วนแสดงภาพ

#### ตารางหลัก (Main Table)
- ใช้ `img.thumbnail || img.image` สำหรับการแสดงภาพ
- เพิ่มปุ่มดูภาพต้นฉบับ (ไอคอนเปิดหน้าต่างใหม่) ที่แสดงเมื่อ hover
- ปุ่มจะเปิดภาพต้นฉบับในแท็บใหม่

#### Modal รายละเอียด (Detail Modal)
- Gallery หลักใช้ thumbnail สำหรับการแสดงภาพ
- เพิ่มปุ่ม "ดูภาพต้นฉบับ" และ "ดาวน์โหลด" ใต้ gallery
- Thumbnails ด้านล่างใช้ thumbnail สำหรับการแสดงภาพ

#### Modal แก้ไข (Edit Modal)
- Preview รูปภาพเดิมใช้ thumbnail
- เพิ่มปุ่มดูภาพต้นฉบับ (ไอคอนเปิดหน้าต่างใหม่) ที่มุมซ้ายบน

#### Lightbox Modal
- แสดงภาพต้นฉบับเต็มขนาด
- เพิ่มปุ่ม "ดูภาพขนาดเต็ม" และ "ดาวน์โหลดต้นฉบับ" ใต้ภาพ
- Thumbnails ด้านล่างใช้ thumbnail

### 3. ปุ่มดูภาพต้นฉบับ

#### ในตารางหลัก
```tsx
<Tooltip content="ดูภาพต้นฉบับ" placement="top">
  <a
    href={img.image}
    target="_blank"
    rel="noopener noreferrer"
    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-blue-600"
    onClick={e => e.stopPropagation()}
    aria-label="ดูภาพต้นฉบับ"
  >
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
</Tooltip>
```

#### ใน Modal รายละเอียด
```tsx
<Button
  color="blue"
  size="sm"
  className="text-xs"
  onClick={() => window.open(selectedTree.images[galleryIndex].image, '_blank')}
>
  ดูภาพต้นฉบับ
</Button>
<Button
  color="green"
  size="sm"
  className="text-xs"
  onClick={() => {
    const link = document.createElement('a');
    link.href = selectedTree.images[galleryIndex].image;
    link.download = `tree_image_${selectedTree.id}_${galleryIndex + 1}.jpg`;
    link.click();
  }}
>
  ดาวน์โหลด
</Button>
```

### 4. การแก้ไข Linter Error
แก้ไข `aria-busy` attribute ให้ใช้ string แทน boolean:
```tsx
aria-busy={loading ? "true" : "false"}
```

## ประโยชน์ของการปรับปรุง

1. **ประสิทธิภาพ**: ใช้ thumbnail ขนาดเล็กสำหรับการแสดงภาพ ทำให้โหลดเร็วขึ้น
2. **UX ที่ดีขึ้น**: ผู้ใช้สามารถดูภาพต้นฉบับได้เมื่อต้องการ
3. **การดาวน์โหลด**: เพิ่มความสามารถในการดาวน์โหลดภาพต้นฉบับ
4. **Responsive**: ปุ่มดูภาพต้นฉบับแสดงเมื่อ hover ทำให้ UI สะอาด
5. **Accessibility**: เพิ่ม aria-label และ tooltip สำหรับการเข้าถึง

## การใช้งาน

- **ดูภาพต้นฉบับ**: คลิกปุ่มไอคอนเปิดหน้าต่างใหม่ หรือปุ่ม "ดูภาพต้นฉบับ"
- **ดาวน์โหลด**: คลิกปุ่ม "ดาวน์โหลด" หรือ "ดาวน์โหลดต้นฉบับ"
- **Lightbox**: คลิกที่ภาพเพื่อเปิด lightbox และดูภาพเต็มขนาด

## หมายเหตุ

- ระบบจะใช้ `thumbnail` ถ้ามี หรือ fallback ไปใช้ `image` ถ้าไม่มี thumbnail
- ไฟล์ที่ดาวน์โหลดจะมีชื่อรูปแบบ: `tree_image_{tree_id}_{image_index}.jpg`
- ปุ่มดูภาพต้นฉบับจะเปิดในแท็บใหม่เสมอ 