``# `teavituste_tellimused`

_No description available_

## Language: JavaScript

### Columns

| Name                   | Format                        | Type                   | Description             |
|------------------------|-------------------------------|------------------------|-------------------------|
| `id`                  | `uuid`                       | `string`              |                         |
| `user_id`             | `uuid`                       | `string`              |                         |
| `stripe_subscription_id` | `text`                      | `string`              |                         |
| `created_at`          | `timestamp with time zone`    | `string`              |                         |
| `status`              | `text`                       | `string`              |                         |
| `company_registry_code` | `integer`                   | `number`              |                         |
| `company_name`        | `text`                       | `string`              |                         |
| `payment_status`      | `text`                       | `string`              |                         |
| `last_analysis_id`    | `uuid`                       | `string`              |                         |
| `last_analysis_date`  | `timestamp with time zone`    | `string`              |                         |
| `next_analysis_date`  | `timestamp with time zone`    | `string`              |                         |
| `cancelled_at`        | `timestamp with time zone`    | `string`              |                         |
| `one_time_order_id`   | `text`                       | `string`              |                         |
| `last_payment_date`   | `timestamp with time zone`    | `string`              | Viimase makse kuupäev  |

---

## Read Rows

### Documentation

To read rows in this table, use the `select` method.

#### Read all rows

```javascript
let { data: teavituste_tellimused, error } = await supabase
  .from('teavituste_tellimused')
  .select('*')`` 

#### Read specific columns

javascript

KopeeriRedigeeri

`let { data: teavituste_tellimused, error } = await supabase
  .from('teavituste_tellimused')
  .select('some_column,other_column')` 

#### Read referenced tables

javascript

KopeeriRedigeeri

``let { data: teavituste_tellimused, error } = await supabase
  .from('teavituste_tellimused')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)`` 

#### With pagination

javascript

KopeeriRedigeeri

`let { data: teavituste_tellimused, error } = await supabase
  .from('teavituste_tellimused')
  .select('*')
  .range(0, 9)` 

----------

## Filtering

### Documentation

Supabase provides a wide range of filters.

#### With filtering

javascript

KopeeriRedigeeri

`let { data: teavituste_tellimused, error } = await supabase
  .from('teavituste_tellimused')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])` 

----------

## Insert Rows

### Documentation

`insert` lets you insert into your tables. You can also insert in bulk and do UPSERT.  
`insert` will also return the replaced values for UPSERT.

#### Insert a row

javascript

KopeeriRedigeeri

`const { data, error } = await supabase
  .from('teavituste_tellimused')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()` 

#### Insert many rows

javascript

KopeeriRedigeeri

`const { data, error } = await supabase
  .from('teavituste_tellimused')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()` 

#### Upsert matching rows

javascript

KopeeriRedigeeri

`const { data, error } = await supabase
  .from('teavituste_tellimused')
  .upsert({ some_column: 'someValue' })
  .select()` 

----------

## Update Rows

### Documentation

`update` lets you update rows. It will match all rows by default. You can update specific rows using horizontal filters, e.g., `eq`, `lt`, and `is`.

#### Update matching rows

javascript

KopeeriRedigeeri

`const { data, error } = await supabase
  .from('teavituste_tellimused')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()` 

----------

## Delete Rows

### Documentation

`delete` lets you delete rows. It will match all rows by default, so remember to specify your filters!

#### Delete matching rows

javascript

KopeeriRedigeeri

`const { error } = await supabase
  .from('teavituste_tellimused')
  .delete()
  .eq('some_column', 'someValue')` 

----------

## Subscribe to Changes

### Documentation

Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

#### Subscribe to all events

javascript

KopeeriRedigeeri

`const channels = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'teavituste_tellimused' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()` 

#### Subscribe to inserts

javascript

KopeeriRedigeeri

`const channels = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'teavituste_tellimused' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()` 

#### Subscribe to updates

javascript

KopeeriRedigeeri

`const channels = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'teavituste_tellimused' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()` 

#### Subscribe to deletes

javascript

KopeeriRedigeeri

`const channels = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'teavituste_tellimused' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()` 

#### Subscribe to specific rows

javascript

KopeeriRedigeeri

`const channels = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'teavituste_tellimused', filter: 'some_column=eq.some_value' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()`
