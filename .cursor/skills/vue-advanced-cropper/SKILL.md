---
name: vue-advanced-cropper
description: >
  Type-safe vue-advanced-cropper v2 in apps/web — Cropper, CropperResult,
  getResult/canvas before Multer upload. Use when cropping images for files
  upload or ImageUploader flows.
---

# vue-advanced-cropper (v2)

Docs: [advanced-cropper/vue-advanced-cropper](https://advanced-cropper.github.io/vue-advanced-cropper/)

Installed in `apps/web` as `vue-advanced-cropper@^2.8.9`.

## Imports

```ts
import { Cropper, type CropperResult } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
```

## Types from the package

Use exported types only:

- `CropperResult` — `getResult()` payload (`coordinates`, `canvas?`, `image`)
- `Cropper` — component; instance exposes `getResult`, `rotate`, `flip`, `reset`, …

**Note:** package props are typed as `DefineComponent<any, …>`. Do **not** invent parallel prop interfaces. Prefer:

1. Typed `ref` to the **expose** API (`getResult` → `CropperResult`)
2. Narrow runtime checks on `canvas` before `toBlob`

```ts
import { Cropper, type CropperResult } from 'vue-advanced-cropper'
import { ref, type ComponentPublicInstance } from 'vue'

type CropperExposed = {
  getResult: () => CropperResult
  rotate: (angle: number) => void
  flip: (horizontal: boolean, vertical?: boolean) => void
  reset: () => void
}

const cropperRef = ref<(ComponentPublicInstance & CropperExposed) | null>(null)

function readCanvas(): HTMLCanvasElement {
  const result = cropperRef.value?.getResult()
  if (!result?.canvas) throw new Error('Crop canvas missing')
  return result.canvas
}
```

Enable canvas output:

```vue
<Cropper ref="cropperRef" :src="src" :canvas="true" />
```

## Crop options (this app)

In `ImageCropUploadModal`, **one** crop mode via `Segmented`:

| Mode | Controls |
|---|---|
| Free | no aspect / size constraints |
| Aspect | preset buttons `1:1` `4:3` `3:4` `16:9` `9:16` |
| Width / Height | scale canvas via `canvasToImageFile` |
| Min / Max | `size-restrictions` only |
| Circle | `CircleStencil` + aspect 1 |

Upload meta: `title` + `alt`. Also `PATCH /files/:id/meta`, `GET /files/stats`, `POST /files/bulk-delete`.

## Anti-patterns

- Hand-rolled `interface CropperProps` that duplicates the library
- Using `any` for `getResult()` — use `CropperResult`
- Uploading the original file while showing a crop UI (always upload the cropped blob)
- Forgetting `import 'vue-advanced-cropper/dist/style.css'`
- Cropping in form pickers — upload/crop only on the files admin page; forms use MediaPicker
