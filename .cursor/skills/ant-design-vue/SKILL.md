---
name: ant-design-vue
description: >
  Type-safe Ant Design Vue (antdv) v4 for Vue 3 in apps/web — use package-exported
  *Props, FormInstance, RuleObject, TableColumnType, ThemeConfig; tree-shaken /es
  imports; @ant-design/icons-vue. Use when building UI with ant-design-vue, antdv,
  a-* components, ConfigProvider, or icons-vue.
---

# Ant Design Vue (type-safe v4)

Docs: [overview](https://antdv.com/components/overview) · [introduce](https://antdv.com/docs/vue/introduce) · [theme](https://antdv.com/docs/vue/customize-theme).

**Stack in this repo:** Vue 3 + TypeScript + `ant-design-vue` **4.x** + `@ant-design/icons-vue` in `apps/web`. Confirm versions in `apps/web/package.json`.

App chrome uses Tailwind utilities; **colors** from antdv tokens / `@ant-design/colors` — no SFC `<style>` blocks (`.cursor/rules/web-styling-tailwind-antd.mdc`).

## Source of truth

Use types **exported by `ant-design-vue`** (and subpaths) — never hand-roll duplicate prop interfaces or use `any`:

```ts
import type { ButtonProps } from 'ant-design-vue/es/button';
import type { FormInstance, RuleObject } from 'ant-design-vue/es/form';
import type { TableColumnType } from 'ant-design-vue';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import type { SelectValue, DefaultOptionType } from 'ant-design-vue/es/select';
```

## Imports

Prefer tree-shaken `/es` imports; icons from `@ant-design/icons-vue` only:

```ts
import Button from 'ant-design-vue/es/button';
import Form from 'ant-design-vue/es/form';
import FormItem from 'ant-design-vue/es/form/FormItem';
import Input from 'ant-design-vue/es/input';
import { ConfigProvider } from 'ant-design-vue/es';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';

// Barrel OK for a few co-located components
import { Card, Table, Space, Modal } from 'ant-design-vue';
```

App entry should include reset CSS once:

```ts
import 'ant-design-vue/dist/reset.css';
```

## Typed patterns

### Props from package exports

```ts
import type { ButtonProps } from 'ant-design-vue/es/button';

interface Props {
  type?: ButtonProps['type'];
  loading?: ButtonProps['loading'];
  label: string;
}

const props = defineProps<Props>();
```

### Forms

Contract constraints come from **`@maghami-system/schemas`**. Build antdv `RuleObject`s with `zodRule` and optionally **extra UX rules** (required copy, whitespace) that are not looser than Zod — see `.cursor/rules/shared-validation.mdc`.

```ts
import type { FormInstance, RuleObject } from 'ant-design-vue/es/form';
import { createRoleSchema, type CreateRoleDto } from '@maghami-system/schemas';
import { zodRule } from '@/validation/zod-rule';

const formRef = ref<FormInstance>();
const model = ref<CreateRoleDto>({
  label: '',
  value: '',
  description: null,
  permissionIds: [],
});

const rules: Record<'label' | 'value' | 'description', RuleObject | RuleObject[]> = {
  label: [
    { required: true, whitespace: true, message: 'Label is required' },
    zodRule(createRoleSchema.shape.label),
  ],
  value: [
    { required: true, whitespace: true, message: 'Value is required' },
    zodRule(createRoleSchema.shape.value),
  ],
  description: [zodRule(createRoleSchema.shape.description)],
};
```

Prefer `apps/web/src/validation/*.form-rules.ts` for reusable rule maps. Use `v-model:value` on inputs; `@finish` on `Form`.

Do **not** put antdv imports inside `@maghami-system/schemas`.

### Tables

```ts
import type { TableColumnType } from 'ant-design-vue';

interface Row {
  id: number;
  name: string;
}

const columns: TableColumnType<Row>[] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
];
```

### Theme

```ts
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import { theme } from 'ant-design-vue/es';

const antdTheme: ThemeConfig = {
  token: { colorPrimary: '#1677ff', borderRadius: 6 },
  algorithm: theme.defaultAlgorithm,
};
```

Wrap the app with `ConfigProvider` (`:theme`, optional `:locale`, `direction`).

## v-model (v4)

| Component | Binding |
|-----------|---------|
| Input, Select, Cascader, … | `v-model:value` |
| Checkbox, Switch | `v-model:checked` |
| Modal, Drawer, Dropdown | `v-model:open` |
| Tabs, Collapse | `v-model:activeKey` |
| DatePicker | `v-model:value` (**dayjs**) |

Do not use v3 `visible` / Less theme vars / Moment.js.

## Anti-patterns

- `any` or invented props that duplicate antdv
- Global `app.use(Antd)` instead of `/es` imports (unless the app already registers globally)
- Icons as emoji instead of `@ant-design/icons-vue`
- Assuming v3 Less / `antd.less` APIs

## Checklist

- [ ] Version confirmed in `apps/web/package.json`
- [ ] Types from `ant-design-vue` / `/es` only
- [ ] Tree-shaken imports; `reset.css` once in entry
- [ ] v4 bindings (`open`, `v-model:value`, …)
