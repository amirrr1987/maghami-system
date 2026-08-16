---
name: ant-design-icons-vue
description: >
  Type-safe @ant-design/icons-vue icons for Vue 3 + antdv — named icon
  components only. Use when importing icons for buttons, menus, or antdv slots.
---

# @ant-design/icons-vue (type-safe)

Docs: [ant.design/icons](https://ant.design/components/icon).  
Version: `@ant-design/icons-vue` **^7** in `apps/web`. UI composition: `ant-design-vue` skill.

## Source of truth

Import **named** icon components from the package — each is a typed Vue component:

```ts
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons-vue'
```

## Patterns

```vue
<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <a-button type="primary">
    <template #icon><PlusOutlined /></template>
    Add
  </a-button>
</template>
```

For `Menu` `items` / `h()`, pass the icon component (or `() => h(Icon)`), not a string name.

## Anti-patterns

- String icon names without a component map
- Default/barrel imports that pull all icons
- Wrapping icons in untyped `any` props
