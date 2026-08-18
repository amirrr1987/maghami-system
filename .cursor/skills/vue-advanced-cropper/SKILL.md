---
name: vue-advanced-cropper
description: >
  Type-safe vue-advanced-cropper v2 in apps/web — CropperResult, Coordinates,
  Cropper expose (getResult). Use when cropping images before Multer upload.
---

# vue-advanced-cropper (v2)

Docs: [advanced-cropper/vue-advanced-cropper](https://advanced-cropper.github.io/vue-advanced-cropper/).  
Installed: `vue-advanced-cropper@2.8.9`. Types: `types/index.d.ts`.

## Source of truth

```ts
import {
  Cropper,
  CircleStencil,
  type CropperResult,
  type Coordinates,
  type SizeRestrictions,
  type AspectRatio,
  type Point,
  type Transform,
} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
```

`Cropper` is `DefineComponent<any, { getResult; setCoordinates; refresh; zoom; move; rotate; flip; reset }>`. **Do not** invent prop interfaces — props are untyped in the package. Type the **expose** + `CropperResult`.

## CropperResult

```ts
interface Coordinates {
  width: number
  height: number
  top: number
  left: number
}

interface ImageTransforms {
  rotate: number
  flip: { horizontal: boolean; vertical: boolean }
}

interface CropperResult {
  coordinates: Coordinates
  visibleArea: Coordinates
  canvas?: HTMLCanvasElement
  image: {
    width: number
    height: number
    transforms: ImageTransforms
    src: string | null
  }
}
```

Expose:

```ts
getResult: () => CropperResult
setCoordinates: (transform: Transform | Transform[]) => void
refresh: () => void
zoom: (factor: number, center?: Point) => void
move: (left: number, top?: number) => void
rotate: (angle: number) => void
flip: (horizontal: boolean, vertical?: boolean) => void
reset: () => void
```

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

Enable canvas: `<Cropper :canvas="true" />`. Also exported: `SizeRestrictions` (`minWidth`/`maxWidth`/`minHeight`/`maxHeight`), `AspectRatio` (`minimum?`/`maximum?`), `CircleStencil`.

## This app

`ImageCropUploadModal`: one crop mode via `Segmented` (free / aspect / width-height / min-max / circle). Upload cropped blob, not the original file.

## Anti-patterns

- Hand-rolled `interface CropperProps` duplicating the library
- `any` on `getResult()` — use `CropperResult`
- Forgetting `vue-advanced-cropper/dist/style.css`
- Cropping in form pickers — files admin only; forms use MediaPicker
