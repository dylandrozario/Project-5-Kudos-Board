# Section 1: Component Architecture

## Schema & Spec Alignment

The component spec below assumes the Prisma models exactly as defined:

- `User { id, email, username?, password, boards[], cards[], comments[], createdAt, updatedAt}`  (`username` is optional/nullable in the schema)
- `Board { id, imageURL, authorId, title, category, cards[], createdAt, updatedAt}`
- `Card { id, title, description?, pinned, pinnedAt, gifUrl, upvotes, authorId, boardId, comments[], createdAt, updatedAt}`
- `Comment { id, message, cardId, authorId, createdAt, updatedAt}`

- All IDs are `number`, not `string`.
- **Home Page** must render Header, Banner, SearchBar, the boards grid, and a Footer (per README).
- **Filter categories** are: `All/Home`, `Recent`, `Celebration`, `Thank you`, `Inspiration` (per README). `Recent` is a special view — the 6 most recently created boards — not a stored `Board.category`. The wireframe also shows a chip called "Team Shoutouts" — omit this one, it's not in the README's category list.
- **Search** is submit-driven, not live-filter: text input + submit button + clear mechanism. Submit fires on submit-button click; clearing the text restores the full list.
- **Delete Board** is a core feature, so `BoardCard` exposes a delete control.
- **Add New Board** fields per README: Title (required), Category (required), Author (optional). Author is a free-text username; the backend resolves it to a `User` row (creating one if needed) or defaults to the seeded Guest user when blank. See Schema Suggestions (Guest user plan).
- **Add New Card** fields per README: Title (required by schema — short header), Message (required by README — maps to `Card.description`), Gif chosen via the GIPHY API (required), Author (optional, same Guest-user resolution as boards). The GIPHY picker is its own component.
- `Card.upvotes: number` replaces "like" everywhere; clicks simply increment, and a user may upvote unlimited times — no `upvoted` boolean.
- **Comments are a stretch feature presented in a pop-up modal** (per README), not inline beneath the card. The modal shows the card's message, gif, author, and the list of comments.
- `Card.pinned: boolean` is supported by a `PinButton`; the grid sorts pinned cards first and persists across refresh.
- **Dark Mode** (stretch): `ThemeToggle` reads/writes `ThemeContext`, persisted to `localStorage` so the choice survives navigation and refresh; default is light.
- **User Accounts** (stretch): adds `LoginPage`, `SignupPage`, and an `AuthContext` so the Header can show the current user and "My boards" can filter on `authorId`.
- `Board.imageURL` is the cover image source for both `BoardCard` (Homepage grid) and `BoardBanner` (Board page hero).
- `User.username` is the display label for `UserAvatar` and per-card/per-comment author labels. It's optional in the schema, but the **Guest user** seeded at id `1` always has `username: "Guest"`, so anonymous content still displays a real label. No `imageUrl` field exists on `User` — the `Avatar` component derives an initial from `username` (falling back to `?` if somehow null).

---

## Homepage

The Homepage shows a searchable, category-filterable grid of kudos boards, plus a global header with branding, search, a create-board action, theme toggle, and user avatar.

### HomePage

**Responsibility**

- Top-level page that loads all kudos boards and coordinates the search, category filter, create-board, and delete-board flows.

**Renders**

- `<Header />` (Header renders its own `<SearchBar />` internally; HomePage passes the search state and handlers in via props)
- `<Banner />`
- `<CategoryTabs categories={...} selected={selectedCategory} onSelect={...} />`
- `<BoardGrid boards={filteredBoards} onDeleteBoard={...} />`
- `<CreateBoardModal isOpen={isCreateOpen} ... />` (rendered conditionally when open)
- `<Footer />`

**Props**

- _(none)_ — top-level page component; receives no props. Boards are fetched from the API.

**State**

- `boards: Board[]` — full list returned from `GET /boards`. Server state.
- `searchInput: string` — current text in the search input (before submit). Local UI state.
- `searchQuery: string` — committed query; only updates on submit/clear, drives filtering. Local UI state.
- `selectedCategory: 'All' \| 'Recent' \| 'Celebration' \| 'Thank you' \| 'Inspiration'` — active filter tab (per README). Local UI state.
- `isCreateOpen: boolean` — whether the Create Board modal is open. Local UI state.
- `isLoading: boolean`, `error: string \| null` — fetch lifecycle. Server state.

**Interactions**

- On mount: fetch all boards.
- Search submit (submit-button click): commits `searchInput` → `searchQuery`; the grid filters by `title.includes(query)` (case-insensitive).
- Search clear (clear button, or text emptied + submit): resets `searchQuery` to `''`, restoring the full list.
- Category tab click: updates `selectedCategory`. For `Recent`, the grid shows the 6 most recently created boards (`orderBy createdAt desc, take 6`); for the others, filters by `Board.category`.
- "+ Create Board" click: sets `isCreateOpen = true`.
- Create modal submit: posts new board, prepends to `boards`, closes modal.
- Board card click: navigates to `/boards/:id` (numeric id).
- Board delete click (from `BoardCard`): confirms, calls `DELETE /boards/:id`, removes from `boards`.

---

### Header

**Responsibility**

- Global top bar with branding, the search bar slot, the create-board action, theme toggle, and user avatar on every page.

**Renders**

- `<Logo />`
- `<BackButton />` (only when on a non-home route — visible in the Board wireframe to the left of the logo)
- `<SearchBar />` (rendered here as it appears in the wireframe; the README requires "a search bar on the home page" — same component, owned by the page)
- `<CreateBoardButton />`
- `<ThemeToggle />`
- `<UserAvatar />`

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `searchInput` | `string` | Parent page | Controlled value for the search input. |
| `onSearchInputChange` | `(q: string) => void` | Parent page | Called as the user types. |
| `onSearchSubmit` | `() => void` | Parent page | Called on submit-button click. |
| `onSearchClear` | `() => void` | Parent page | Called on clear click. |
| `onCreateBoard` | `() => void` | Parent page | Opens the Create Board modal. |
| `showBackButton` | `boolean` | Routing / parent | Whether to render the back arrow. |

**State**

- None. Header is presentational; the search value is controlled by the parent.

**Interactions**

- Forwards search input, submit, and clear to the page.
- Forwards "+ Create Board" click via `onCreateBoard`.
- Theme toggle and user avatar handle their own clicks (see below).

---

### Banner

**Responsibility**

- A static promotional banner displayed beneath the header on the Home Page (required by the README).

**Renders**

- `<section>` with a heading, supporting text, and an optional background image/illustration.

**Props**

- None.

**State**

- None.

**Interactions**

- None.

---

### Footer

**Responsibility**

- Global footer displayed at the bottom of every page (required by the README for the Home Page).

**Renders**

- `<footer>` containing copyright text and any project links.

**Props**

- None.

**State**

- None.

**Interactions**

- None (any links handle their own navigation).

---

### Logo

**Responsibility**

- Display the "Kudos Hub" wordmark and link back to the homepage.

**Renders**

- `<a>` / `<Link>` wrapping a text span "Kudos Hub".

**Props**

- None.

**State**

- None.

**Interactions**

- Click → navigate to `/`.

---

### BackButton

**Responsibility**

- Provide a back-arrow control to return to the previous route, visible in the Board page header.

**Renders**

- `<button>` containing a left-arrow icon.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `onClick` | `() => void` | Parent / routing | Defaults to `navigate(-1)` or to `/`. |

**State**

- None.

**Interactions**

- Click → navigates back.

---

### SearchBar

**Responsibility**

- Render the search `<form>` for filtering boards by title — text input, submit button, and clear button (per README).

**Renders**

- `<form>` containing a magnifying-glass icon, `<input type="text">` with placeholder `"Search for kudos boards, themes..."`, a submit `<button type="submit">`, and a clear `<button type="button">` (an "×" inside the input, visible when value is non-empty).

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `value` | `string` | HomePage | Controlled input value (`searchInput`). |
| `onChange` | `(q: string) => void` | HomePage | Fires on every keystroke. |
| `onSubmit` | `() => void` | HomePage | Fires on submit-button click. |
| `onClear` | `() => void` | HomePage | Fires on clear-button click. |
| `placeholder` | `string` | HomePage | Default placeholder. |

**State**

- None. Controlled by parent.

**Interactions**

- Typing → `onChange`.
- Submit click → `onSubmit`.
- Clear click → `onClear`, which empties the input and the committed query.

---

### CreateBoardButton

**Responsibility**

- Primary call-to-action button that opens the Create Board modal.

**Renders**

- Orange pill `<button>` with a "+" icon and the label "Create Board".

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `onClick` | `() => void` | Header | Opens the modal. |

**State**

- None.

**Interactions**

- Click → opens `CreateBoardModal`.

---

### ThemeToggle

**Responsibility**

- Switch between light and dark themes.

**Renders**

- Icon `<button>` (sun/moon glyph visible in the wireframe).

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | Theme context | Current theme. |
| `onToggle` | `() => void` | Theme context | Flips the theme. |

**State**

- None locally; theme is read from a `ThemeContext`.

**Interactions**

- Click → toggles theme on the root element / context.

---

### UserAvatar

**Responsibility**

- Display the current user's avatar in the top-right corner.

**Renders**

- Circular `<button>` / `<img>` with a user glyph.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `user` | `{ id: number; email: string; username: string \| null }` | Auth context | Current user from the `User` model. `username` is optional in the schema, but the Guest user always has one. `Avatar` derives an initial from it (falling back to `?` if null). |
| `onClick` | `() => void` | Header | Opens user menu |

**State**

- None.

**Interactions**

- Click → opens a dropdown menu

---

### CategoryTabs

**Responsibility**

- Render the row of category filter chips and report the active selection.

**Renders**

- `<nav>` containing one `<CategoryTab>` per category. Per README the canonical set is: `All`, `Recent`, `Celebration`, `Thank you`, `Inspiration`.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `categories` | `string[]` | HomePage | Ordered list of tab labels (see above). |
| `selected` | `string` | HomePage | Currently active tab. |
| `onSelect` | `(category: string) => void` | HomePage | Fires when a tab is clicked. |

**State**

- None.

**Interactions**

- Delegates clicks to children via `onSelect`.

---

### CategoryTab

**Responsibility**

- Render a single category chip and report click events.

**Renders**

- `<button>` with the category label; styled as filled-orange when active, ghost otherwise.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `label` | `string` | CategoryTabs | The chip's text. |
| `isActive` | `boolean` | CategoryTabs | Drives styling. |
| `onClick` | `() => void` | CategoryTabs | Reports selection. |

**State**

- None.

**Interactions**

- Click → `onClick`.

---

### BoardGrid

**Responsibility**

- Lay out the filtered set of boards in a responsive grid.

**Renders**

- `<section>` / `<ul>` wrapping one `<BoardCard>` per board.
- An `<EmptyState>` if the filtered list is empty.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `boards` | `Board[]` | HomePage | Already-filtered list to render. |
| `isLoading` | `boolean` | HomePage | Renders skeletons when true (assumption). |
| `onDeleteBoard` | `(id: number) => void` | HomePage | Forwarded to each `BoardCard`. |

**State**

- None.

**Interactions**

- Forwards `onDeleteBoard` to each `BoardCard`; otherwise children handle their own clicks.

---

### BoardCard

**Responsibility**

- Display a single board's preview tile (image + title), provide a delete control, and navigate into the board on click.

**Renders**

- A clickable `<Link to={`/boards/:id`}>` wrapping `<img>` (cover) + `<h3>` (title) + `<CategoryBadge>`, plus a sibling absolutely-positioned `<DeleteButton />` overlay. Keeping the delete button outside the `<Link>` avoids the invalid HTML pattern of `<button>` nested inside `<a>`.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `board` | `Board` (`{ id: number; title: string; category: string; imageURL: string; authorId: number; createdAt; updatedAt }`) | BoardGrid | The board to display. `imageURL` is rendered as the cover photo. |
| `onClick` | `(id: number) => void` | BoardGrid | Navigation handler; defaults to `Link` to `/boards/:id`. |
| `onDelete` | `(id: number) => void` | BoardGrid | Delete handler. |

**State**

- None.

**Interactions**

- Click on the card body (the `<Link>`) → navigates to `/boards/:id`.
- Click on the overlaid delete control → confirms, calls `onDelete`. Because the delete button is a sibling of the `<Link>` (not nested inside it), there's no need to `stopPropagation`.

---

### CreateBoardModal (per README "Add New Board")

**Responsibility**

- Collect `title` (required), `category` (required), and `author` (optional) for a new `Board` and submit it.

**Renders**

- `<Modal>` wrapping a `<form>` with `<Input>` (title), `<Select>` (category — fixed list: Celebration, Thank you, Inspiration), `<Input>` (author, optional), and submit/cancel `<Button>`s.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `isOpen` | `boolean` | HomePage | Controls visibility. |
| `onClose` | `() => void` | HomePage | Close handler. |
| `onCreate` | `(payload: { title: string; category: string; authorName?: string }) => Promise<void>` | HomePage | Submit handler; posts to `POST /boards`. |

**State**

- `title: string`, `category: string`, `authorName: string`, `isSubmitting: boolean`, `error: string \| null`.

**Interactions**

- Field edits update local state.
- Validates that `title` and `category` are non-empty before allowing submit.
- Submit → `onCreate`, then close on success.
- Author is free-text per the README; the backend resolves it to a `User.id` (creating one if needed) or defaults to the Guest user when blank — see Schema Suggestions.

---

## Board Page

The Board page shows a single board's hero banner (with title, category, card count, and "+ Add card") plus a grid of kudos cards with avatar, title, description, gif, and upvote/comment/pin/delete actions.

### BoardPage

**Responsibility**

- Top-level page that loads one board and its cards and coordinates the add-card, upvote, pin, delete, and comments flows.

**Renders**

- `<Header showBackButton />`
- `<BoardBanner board={board} cardCount={board.cards.length} onAddCard={...} />`
- `<CardGrid cards={sortedCards} onUpvote={...} onOpenComments={...} onPin={...} onDelete={...} />`
- `<AddCardModal isOpen={isAddCardOpen} boardId={boardId} ... />` (conditional)
- `<CommentModal isOpen={!!commentsModalCardId} card={...} ... />` (conditional; stretch)
- `<Footer />`

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| _(route param)_ | `boardId: number` | React Router | Read from the URL via `useParams` and coerced to a number. |

**State**

- `board: (Board & { author: User; cards: (Card & { author: User; comments: Comment[] })[] }) \| null` — single nested payload returned by `GET /boards/:id`. Cards and comments live inside `board.cards`; there is no separate `cards` state. Server state.
- `isAddCardOpen: boolean` — controls the `<AddCardModal>`. Local UI state.
- `commentsModalCardId: number \| null` — which card's `<CommentModal>` is open (per README, comments display in a pop-up modal). Local UI state.
- `isLoading: boolean`, `error: string \| null`.

Derived (recomputed each render, not stored):
- `sortedCards = sort(board?.cards ?? [])` — pinned-first by `pinnedAt DESC`, then unpinned by `createdAt DESC`.

**Interactions**

- On mount: fetch board (`include: { author: true, cards: { include: { author: true, comments: true } } }`).
- "+ Add card" click: opens `<AddCardModal>`.
- Add Card modal submit: posts card, then updates `board` by inserting the new card into `board.cards` (closes modal on success).
- Comment click on a card: sets `commentsModalCardId` → opens `<CommentModal>`.
- Upvote / pin / delete on a card: optimistic update happens on the parent `board` object (mutate the matching `board.cards[i]` entry in a new object, then call the API); revert on failure.
- Cards are rendered pinned-first (most recently pinned first within the pinned group), then unpinned by `createdAt` descending — per README's pinned-card ordering rules.

---

### BoardBanner

**Responsibility**

- Render the full-width hero with the board's cover image, category label, title, card count, and the add-card action.

**Renders**

- `<header>` with a background `<img>` overlay containing:
  - Small uppercase category label ("CELEBRATION")
  - `<h1>` title ("Quarterly Achievers")
  - Card count text ("6 cards")
  - `<AddCardButton />` aligned to the right

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `board` | `Board` | BoardPage | Board metadata from Prisma. `board.imageURL` is rendered as the hero background. |
| `cardCount` | `number` | BoardPage | Length of `cards`. |
| `onAddCard` | `() => void` | BoardPage | Opens the Add Card modal. |

**State**

- None.

**Interactions**

- Forwards "+ Add card" click to parent.

---

### AddCardButton

**Responsibility**

- Secondary CTA inside the banner that opens the Add Card modal.

**Renders**

- Dark pill `<button>` with a "+" icon and the label "Add card".

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `onClick` | `() => void` | BoardBanner | Opens the modal. |

**State**

- None.

**Interactions**

- Click → opens `AddCardModal`.

---

### CardGrid

**Responsibility**

- Lay out kudos cards in a responsive multi-column grid.

**Renders**

- `<section>` containing one `<KudosCard>` per card; `<EmptyState>` if no cards yet.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `cards` | `Card[]` | BoardPage | The board's cards (already sorted pinned-first by parent). |
| `onUpvote` | `(cardId: number) => void` | BoardPage | Increments `Card.upvotes` (no toggle — README allows unlimited upvotes). |
| `onOpenComments` | `(cardId: number) => void` | BoardPage | Opens the `<CommentModal>` for a card. |
| `onPin` | `(cardId: number, pinned: boolean) => void` | BoardPage | Toggles `Card.pinned`. |
| `onDelete` | `(cardId: number) => void` | BoardPage | Delete callback. |

**State**

- None.

**Interactions**

- Delegates to children.

---

### KudosCard

**Responsibility**

- Display one kudo (title, message/description, GIF, upvote count, author) plus an action row with upvote, comments, pin, and delete (per README).

**Renders**

- `<article>` containing:
  - `<Avatar />` + author label (`author.username`) — always rendered. With the Guest user plan every card has a real `author`; anonymous cards just display "Guest".
  - `<h3>` rendering `card.title` — **required by schema** and always rendered, even though the Board wireframe does not show it as a separate element.
  - `<img src={card.gifUrl}>` — the GIF attached to the card (required field)
  - Optional `<p>` rendering `card.description` — the longer body text (what the wireframe's "Absolutely crushed it this quarter…" maps to)
  - Action row: `<UpvoteButton />`, `<CommentButton />`, `<PinButton />`, `<DeleteButton />`

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `card` | `Card & { author: User; comments: Comment[] }` | CardGrid | The card with its author (always present — Guest user backs anonymous cards) and comments included. Fields used: `id, title, description, gifUrl, upvotes, pinned, author.username, comments`. |
| `onUpvote` | `(id: number) => void` | CardGrid | Increments `upvotes`. |
| `onOpenComments` | `(id: number) => void` | CardGrid | Opens the `<CommentModal>` for this card. |
| `onPin` | `(id: number, pinned: boolean) => void` | CardGrid | Toggles `pinned`. |
| `onDelete` | `(id: number) => void` | CardGrid | Deletes the card. |

**State**

- None. KudosCard is presentational. Optimistic upvote/pin updates happen on BoardPage's `board` state (which owns `cards`) so the displayed count never drifts from server data. No `hasUpvoted` — README allows unlimited upvotes per user.

**Interactions**

- Upvote click: calls `onUpvote(card.id)`. BoardPage bumps `board.cards[i].upvotes` optimistically and calls `PATCH /cards/:id/upvote`. Clicking again continues to increment.
- Comment click: calls `onOpenComments(card.id)` → BoardPage opens the `<CommentModal>`.
- Pin click: calls `onPin(card.id, !card.pinned)` → BoardPage flips `pinned` (and `pinnedAt`) on its `board` state and calls `PATCH /cards/:id`.
- Delete click: confirms (native `confirm()` for v1), calls `onDelete(card.id)` → BoardPage removes it from `board.cards` and calls `DELETE /cards/:id`.

---

### Avatar

**Responsibility**

- Render a colored circular avatar showing the user's initial (derived from `username`).

**Renders**

- `<div>` styled as a circle with a single letter (first character of `username`).

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `username` | `string` | KudosCard / UserAvatar / CommentItem | Used to derive the initial. |
| `color` | `string?` | KudosCard | Background color for the initial bubble (each card in the wireframe uses a different color). |
| `size` | `'sm' \| 'md' \| 'lg'` | Parent | Visual size. |

**State**

- None.

**Interactions**

- None.

---

### UpvoteButton

**Responsibility**

- Show the upvote (heart) icon and `Card.upvotes` count and emit an upvote event.

**Renders**

- `<button>` with a heart `<svg>` and a numeric count.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `count` | `number` | KudosCard | `Card.upvotes` value to display. |
| `onClick` | `() => void` | KudosCard | Increment handler. |

**State**

- None (controlled).

**Interactions**

- Click → `onClick`.

---

### CommentButton

**Responsibility**

- Show the comment icon and count and emit a comment-toggle event.

**Renders**

- `<button>` with a speech-bubble `<svg>` and a numeric count.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `count` | `number` | KudosCard | `card.comments.length`. |
| `onClick` | `() => void` | KudosCard | Open the `<CommentModal>` for this card. |

**State**

- None.

**Interactions**

- Click → `onClick`.

---

### PinButton

**Responsibility**

- Toggle a card's `pinned` flag so it floats to the top of the grid.

**Renders**

- `<button>` with a pin `<svg>`; filled when pinned, outline otherwise.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `pinned` | `boolean` | KudosCard | Current `Card.pinned` value. |
| `onClick` | `() => void` | KudosCard | Calls `onPin(card.id, !pinned)`. |

**State**

- None.

**Interactions**

- Click → `onClick`.

---

### CommentModal (stretch — per README, comments live in a pop-up modal)

**Responsibility**

- Pop-up modal that shows a card's full content (title, description, gif, author) and the list of comments with an inline add-comment form.

**Renders**

- `<Modal>` containing:
  - The card's `gifUrl` `<img>`, `title`, `description` (if any), and author label (`author.username` — "Guest" for anonymous)
  - `<ul>` of `<CommentItem>` rows
  - `<CommentForm>` at the bottom
  - A close `<IconButton>`

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `isOpen` | `boolean` | BoardPage | Whether the modal is rendered. |
| `card` | `Card & { author: User; comments: (Comment & { author: User })[] }` | BoardPage | The card whose comments are being shown. Authors are always present (Guest backs anonymous content). |
| `onClose` | `() => void` | BoardPage | Close handler. |
| `onAddComment` | `(cardId: number, message: string, authorName?: string) => void` | BoardPage | Creates a `Comment`. |
| `onDeleteComment` | `(commentId: number) => void` | BoardPage | Deletes a `Comment`. |

**State**

- None (form state lives inside `<CommentForm>`).

**Interactions**

- Delegates submit/delete to children.
- Close button or ESC → `onClose`.

---

### CommentItem

**Responsibility**

- Render a single comment's author, message, and a delete control.

**Renders**

- `<li>` containing `<Avatar />`, author label (`author.username` — "Guest" for anonymous), message text, and a small `<DeleteButton />`.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `comment` | `Comment & { author: User }` | CommentModal | The comment to display (author always present — Guest user backs anonymous comments). |
| `onDelete` | `(commentId: number) => void` | CommentModal | Delete handler. |

**State**

- None.

**Interactions**

- Click on delete → confirms, then `onDelete(comment.id)`.

---

### CommentForm

**Responsibility**

- Capture and submit a new comment for the current card. Per README, only `message` is required; author label is optional.

**Renders**

- `<form>` containing a `<TextArea>` (message, required), an optional `<Input>` (author name), and a submit `<Button>`.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `cardId` | `number` | CommentModal | Target card. |
| `onSubmit` | `(cardId: number, message: string, authorName?: string) => void` | CommentModal | Submit handler. |

**State**

- `message: string` — controlled textarea value.
- `authorName: string` — controlled optional input.
- `isSubmitting: boolean`.

**Interactions**

- Type → updates local state.
- Submit (when `message` is non-empty) → calls `onSubmit(cardId, message, authorName || undefined)`. On success, the form resets `message` and `authorName` to empty so the user can post another comment without closing the modal. The `<CommentModal>` itself stays open until the user clicks the close button.

---

### DeleteButton

**Responsibility**

- Trigger deletion of the parent card.

**Renders**

- `<button>` with a trash `<svg>` and the label "Delete".

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `onClick` | `() => void` | KudosCard | Delete handler. |

**State**

- None.

**Interactions**

- Click → confirms, then `onClick`.

---

### AddCardModal (per README "Add New Card")

**Responsibility**

- Collect a title (required by schema — short header), a message/description (required by README — the kudo's body), a GIPHY-picked gif URL (required), and an optional author for a new `Card`, then submit it.

**Renders**

- `<Modal>` wrapping a `<form>` with `<Input>` (title, required), `<TextArea>` (description / message, required), `<GiphyPicker>` (search-and-select gif, required), `<Input>` (author, optional), submit/cancel `<Button>`s.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `isOpen` | `boolean` | BoardPage | Controls visibility. |
| `boardId` | `number` | BoardPage | Where the card belongs. |
| `onClose` | `() => void` | BoardPage | Close handler. |
| `onCreate` | `(payload: { title: string; description: string; gifUrl: string; authorName?: string }) => Promise<void>` | BoardPage | Submit handler; posts to `POST /boards/:boardId/cards`. Backend resolves `authorName` to a `User.id` (creating one if needed) or defaults to the Guest user's id when blank. |

**State**

- `title: string`, `description: string`, `gifUrl: string`, `authorName: string`, `isSubmitting: boolean`, `error: string \| null`.

**Interactions**

- Field edits update local state.
- Validates that `title`, `description`, and `gifUrl` are non-empty before allowing submit. (`description` is optional in the schema but treated as required in the form to satisfy the README's "Text message (required)".)
- Submit → `onCreate`, then close on success.

---

### GiphyPicker (required by README's "search for and select within the form using the GIPHY API")

**Responsibility**

- Let the user search GIPHY and pick one gif; report the chosen gif URL to the parent form.

**Renders**

- `<div>` containing an `<Input>` (search query), a grid of `<img>` thumbnails from the GIPHY search response, and a "selected gif" preview.

**Props**

| Prop | Type | Source | Description |
|---|---|---|---|
| `value` | `string` | AddCardModal | Currently selected gif URL (controlled). |
| `onChange` | `(gifUrl: string) => void` | AddCardModal | Called when the user picks a gif. |

**State**

- `query: string` — current search input.
- `results: GiphyGif[]` — response from `GET https://api.giphy.com/v1/gifs/search?q=…&api_key=…`.
- `isSearching: boolean`, `error: string \| null`.

**Interactions**

- Type in query → debounced fetch to GIPHY.
- Click a thumbnail → `onChange(gif.images.original.url)`.

---

# Component Hierarchy

### Homepage tree

```
App
└── HomePage
    ├── Header
    │   ├── Logo
    │   ├── SearchBar
    │   │   ├── Input
    │   │   ├── Button     (submit)
    │   │   └── IconButton (clear)
    │   ├── CreateBoardButton
    │   ├── ThemeToggle
    │   └── UserAvatar
    ├── Banner
    ├── CategoryTabs
    │   └── CategoryTab (×5: All, Recent, Celebration, Thank you, Inspiration)
    ├── BoardGrid
    │   └── BoardCard (×N)
    │       ├── Link → /boards/:id
    │       │   ├── img            (board.imageURL)
    │       │   ├── h3             (board.title)
    │       │   └── CategoryBadge  (board.category)
    │       └── DeleteButton       (overlay; sibling of Link, not nested)
    ├── CreateBoardModal   (conditional)
    │   └── Modal
    │       ├── Input  (title)
    │       ├── Select (category)
    │       ├── Input  (author, optional)
    │       └── Button (×2: Cancel, Create)
    └── Footer
```

### Board Page tree

```
App
└── BoardPage
    ├── Header
    │   ├── BackButton
    │   ├── Logo
    │   ├── SearchBar
    │   ├── CreateBoardButton
    │   ├── ThemeToggle
    │   └── UserAvatar
    ├── BoardBanner
    │   └── AddCardButton
    ├── CardGrid
    │   └── KudosCard (×N)
    │       ├── Avatar           (author.username; "Guest" for anonymous)
    │       ├── h3               (card.title — required)
    │       ├── img              (card.gifUrl)
    │       ├── p                (card.description)
    │       ├── UpvoteButton
    │       ├── CommentButton
    │       ├── PinButton
    │       └── DeleteButton
    ├── AddCardModal       (conditional)
    │   └── Modal
    │       ├── Input        (title, required)
    │       ├── TextArea     (description / message, required)
    │       ├── GiphyPicker  (search + select gif, required)
    │       ├── Input        (author, optional)
    │       └── Button       (×2: Cancel, Add Card)
    ├── CommentModal       (conditional, stretch)
    │   └── Modal
    │       ├── img / message / description / author
    │       ├── CommentItem (×N)
    │       │   ├── Avatar
    │       │   └── DeleteButton
    │       └── CommentForm
    │           ├── TextArea (message)
    │           ├── Input    (author, optional)
    │           └── Button   (submit)
    └── Footer
```

---

# Shared Components

Components that should be reusable across both pages:

- **Header** — same global bar appears on both pages with one variation (back button on the Board page). One configurable component beats two near-duplicates.
- **Footer** — appears on both pages per the README's Home Page checklist; trivial to reuse.
- **SearchBar** — submit-driven form, used on the Home Page; structure is generic enough to reuse.
- **Button** — both pages use the same orange primary pill, dark secondary pill, and ghost buttons. A single `Button` with `variant` + `size` props covers all of them.
- **IconButton** — used for ThemeToggle, BackButton, UpvoteButton, CommentButton, PinButton, DeleteButton. Same shape, different icon and tooltip.
- **Avatar** — used by `UserAvatar` (header), the per-card author avatar, and the comment author avatar; one primitive with size/color variants.
- **Card** — both `BoardCard` and `KudosCard` share rounded-corner, shadowed container styling. A presentational `Card` wrapper can hold the common chrome.
- **Modal** — used by `CreateBoardModal`, `AddCardModal`, and `CommentModal`. Handles overlay, focus trap, ESC/click-out close.
- **Input / TextArea / Select** — used inside every modal; should be standalone form primitives.
- **CategoryBadge** — the small uppercase category label appears on board tiles and at the top of the board banner. Same primitive in both spots.
- **EmptyState** — generic component for "no boards match" and "no cards yet".
- **Loader / Skeleton** — both pages need a loading state while fetching.

Reusing these keeps visual consistency, reduces duplicated CSS, and means visual tweaks (e.g., dark-mode color tokens) propagate everywhere from one place — important because Dark Mode is a stretch goal that touches every page.

---

# Data Flow

### Homepage

- **Server data (API):** `HomePage` calls `GET /boards` on mount. For `Recent`, the page calls `GET /boards?sort=recent&limit=6` (or sorts client-side). Search can stay client-side for v1 (`?q=` available for server-side if needed).
- **Props down:** `HomePage` passes `searchInput`, `searchQuery`, `selectedCategory`, filtered `boards` down to `Header`, `CategoryTabs`, `BoardGrid`.
- **Callbacks up:**
  - `SearchBar → Header → HomePage`: `onSearchInputChange`, `onSearchSubmit`, `onSearchClear`
  - `CategoryTab → CategoryTabs → HomePage`: `onSelect`
  - `CreateBoardButton → Header → HomePage`: `onCreateBoard`
  - `BoardCard → BoardGrid → HomePage`: navigation to `/boards/:id` (via `Link`), plus `onDeleteBoard` (DELETE `/boards/:id`)
  - `CreateBoardModal → HomePage`: `onCreate` (POST `/boards`)
- **Context / global:**
  - `ThemeContext` for light/dark mode (stretch — persisted to `localStorage`; default light).
  - `AuthContext` (stretch — User Accounts) for the current user shown in `UserAvatar`; also enables the "My boards" filter.

### Board Page

- **Server data (API):** `BoardPage` calls `GET /boards/:id` on mount with `cards` and (for the comment modal) `comments` included.
- **Props down:** `BoardPage` passes `board` → `BoardBanner`, `cards` (sorted pinned-first, then by `createdAt`) + handlers → `CardGrid` → `KudosCard`. The card whose comments are open is passed to `<CommentModal>`.
- **Callbacks up:**
  - `AddCardButton → BoardBanner → BoardPage`: `onAddCard`
  - `UpvoteButton / CommentButton / PinButton / DeleteButton → KudosCard → CardGrid → BoardPage`: `onUpvote`, `onOpenComments`, `onPin`, `onDelete`
  - `CommentForm → CommentModal → BoardPage`: `onAddComment` (POST `/cards/:id/comments`)
  - `CommentItem → CommentModal → BoardPage`: `onDeleteComment` (DELETE `/comments/:id`)
  - `AddCardModal → BoardPage`: `onCreate` (POST `/boards/:id/cards`); the GIPHY picker handles its own GIPHY API calls and only reports the chosen URL upward.
  - Header callbacks (search, create board, back) bubble the same way as on the Homepage.
- **Context / global:** `ThemeContext` (stretch), `AuthContext` (stretch). `AuthContext.user.id` supplies `authorId` for creates server-side when User Accounts is implemented; until then, the seeded Guest user (id `1`) satisfies the required `authorId` foreign key for anonymous content.

### Cross-cutting

- Theme and current user belong in React Context; everything else is local server state owned by the page component.
- Routing (`react-router`) provides `boardId` to `BoardPage` and powers the `BoardCard` → board navigation and the `BackButton`.

---

# Component Granularity

Classification of every component listed above:

- **Page components** (one per route, own data fetching and top-level state): `HomePage`, `BoardPage` (plus stretch `LoginPage`, `SignupPage`).
- **Layout components** (structural, appear on multiple pages): `Header`, `Footer`, `Banner`, `BoardBanner`, `CategoryTabs`, `BoardGrid`, `CardGrid`.
- **Feature components** (domain-specific, only meaningful in the Kudos Hub app): `BoardCard`, `KudosCard`, `CommentModal`, `CommentItem`, `CommentForm`, `CreateBoardModal`, `AddCardModal`, `GiphyPicker`, `AddCardButton`, `CreateBoardButton`.
- **Reusable UI components** (domain-agnostic primitives): `Button`, `IconButton`, `Input`, `TextArea`, `Select`, `Modal`, `Avatar`, `Card`, `CategoryBadge`, `SearchBar`, `Logo`, `BackButton`, `ThemeToggle`, `UserAvatar`, `UpvoteButton`, `CommentButton`, `PinButton`, `DeleteButton`, `EmptyState`, `Loader`.

Granularity guidelines applied:

- Sections that hold meaningful logic or layout (e.g., `BoardBanner`, `CardGrid`) are their own components rather than being inlined in the page.
- Tiny wrappers around one element are only their own component when they are genuinely reused (`Logo`, `Avatar`, `CategoryBadge`) or when they encapsulate behavior (`ThemeToggle` reads context). Pure cosmetic spans are not promoted into components.
- The same `Modal` + form primitives compose `CreateBoardModal` and `AddCardModal` — composition over duplicate dialog code.
- The same `Card`, `Avatar`, and `Button` primitives are reused by both pages, so visual changes propagate from one place.

---

## Assumptions made (not visible in the wireframes)

- The wireframe's "Explore" chip is rendered as the selected state of the "All" filter; the canonical category set comes from the README: `All`, `Recent`, `Celebration`, `Thank you`, `Inspiration`.
- "Team Shoutouts" in the wireframe is not in the README's required filter list; treated as an optional category value rendered only if present in the seed data.
- `UserAvatar` opens a user menu on click (no menu is drawn). Active only when stretch User Accounts is implemented.
- README requires a Banner on the Home Page; the wireframe shows the category tabs near the top but no distinct banner — added as its own static section.
- `Card.pinned` is not visually distinct in the wireframe; assumed visual feedback is a pin icon + border highlight on pinned cards (per README's stretch description).

---

## Schema Suggestions

The current Prisma schema already covers most of the app. Two things still need to be addressed:

### 1. Guest user for "Author (optional)" — implementation plan

Every entity (`Board`, `Card`, `Comment`) has a required `authorId: Int` foreign key, but the README's create forms all let the author be left blank. The solution is to seed a singleton **Guest** user and route anonymous content to it. **No schema change required.**

**Step 1 — seed the Guest user once when the database is set up:**

```js
await prisma.user.create({
  data: {
    id: 1,
    email: "guest@kudos.local",
    username: "Guest",
    password: "(unused)",
  }
});
```

**Step 2 — in every create route, default `authorId` to `1` when the form's author field is blank:**

```js
app.post('/boards', async (req, res) => {
  const { title, category, imageUrl, authorName } = req.body;
  let authorId = 1; // Guest

  if (authorName) {
    // create or reuse a User row matching the typed name
    const author = await prisma.user.upsert({
      where: { username: authorName },
      update: {},
      create: {
        username: authorName,
        email: `${authorName}@kudos.local`,
        password: "(unused)",
      },
    });
    authorId = author.id;
  }

  const board = await prisma.board.create({
    data: { title, category, imageUrl, authorId },
  });
  res.json(board);
});
```

The same shape applies to `POST /boards/:id/cards` and `POST /cards/:id/comments`.

**Result:**
- Every row always has a real `author` relation, so the frontend never has to handle `null`.
- Anonymous content shows "Guest" on the card.
- A typed author shows that name on the card.
- **Caveat:** never delete the Guest user — the schema's `onDelete: Cascade` would wipe out every anonymous Board/Card/Comment with it.

### 2. `Card.pinnedAt` for pin ordering

`Card.pinned: Boolean` tells you *whether* a card is pinned but not *when*. The README requires "More recent pins should appear first," which needs a timestamp.

**Suggested change:** add `pinnedAt: DateTime?` to `Card`.

```prisma
model Card {
  pinned    Boolean   @default(false)
  pinnedAt  DateTime?
  // ...rest unchanged
}
```

**Backend logic when toggling:**
- Pin → `{ pinned: true, pinnedAt: new Date() }`
- Unpin → `{ pinned: false, pinnedAt: null }`

**Query for the Board page card list:**
```js
orderBy: [
  { pinned: 'desc' },     // pinned first
  { pinnedAt: 'desc' },   // most recently pinned first within the pinned group
  { createdAt: 'desc' },  // unpinned: newest first
]
```

Only needed if implementing the stretch Pinned Cards feature.

---

## Deployment Notes

### SPA fallback for client-side routes (react-router-dom)

The frontend uses `react-router-dom`'s `<BrowserRouter>`, which means non-root URLs like `/boards/3` are handled entirely on the client. The browser still asks the host for that path on a hard refresh, share, or bookmark — and unless the host knows to return `index.html` for any unknown path, the user will get a 404.

- **Local dev (Vite):** Vite's dev server does this automatically. No config needed — `npm run dev` "just works" on any route.
- **Production:** the static host needs a rewrite rule. Concretely:
  - **Render (static site):** add a rewrite rule under *Redirects/Rewrites* — `Source: /*` → `Destination: /index.html` → type **Rewrite**.
  - **Vercel:** add a `vercel.json` at the project root with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
  - **Netlify:** create `frontend/public/_redirects` containing `/*    /index.html   200`.
  - **GitHub Pages or any plain static host without rewrite support:** switch from `<BrowserRouter>` to `<HashRouter>` (URLs become `/#/boards/3`, no host config needed).

If the README's "Deployment" stretch goal is pursued and `/boards/:id` 404s on refresh after deploy, this is the cause.

---



# Section 2: API Contracts

## Users
### GET /users/:id
Get a users information by id.

- HTTP Method/Path: GET /users/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "email": "random@gmail.com",
  "username": "bomb.com",
}

Error Response:
- Status Code: 404
{ "error": "User not found." }

### POST /users
Add a new user when they register.

- HTTP Method/Path: POST /users
- Request Body:
{
  "email": "example@gmail.com",
  "username": "exampleuser",
  "password": "examplepassword"
}
- Query Parameters: N/A

Success Response:
- Status Code: 201
- Body Example:
{
  "id": 1,
  "email": "example@gmail.com",
  "username": "exampleuser",
  "boards": [],
  "cards": [],
  "comments": []
}

Error Response:
- Status Code: 400
{ "error": "Cannot create user. {fields} fields are missing." }

### PUT /users/:id
Update a user's profile. Only the provided fields are changed.

- HTTP Method/Path: PUT /users/:id
- Request Body (all fields optional):
{
  "email": "new_email@gmail.com",
  "username": "exampleuser",
  "password": "examplepassword"
}
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example (returns the full updated user):
{
  "id": 1,
  "email": "new_email@gmail.com",
  "username": "exampleuser"
}

Error Response:
- Status Code: 400
{ "error": "Cannot update user" }

---

### DELETE /users/:id
Delete one specific user from the database.

- HTTP Method/Path: DELETE /users/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200

{ "message": "User now deleted" }

Error Response:
- Status Code: 404
{ "error": "User not found." }

Note: deleting a user cascades (onDelete: Cascade) to their boards, cards, and comments. NEVER delete the Guest user (id 1).

---

### POST /login
Authenticate a user and return their profile.

- HTTP Method/Path: POST /login
- Request Body:
{
  "email": "example@gmail.com",
  "password": "examplepassword"
}
  - `email` (required), `password` (required).
- Query Parameters: N/A

Success Response:
- Status Code: 200
- Body Example (password omitted):
{
  "message" : "{user} logged in successfully!"
}

Error Response:
- Status Code: 401
{ "error": "Invalid credentials." }

---

## Boards

### GET /boards
Get the list of boards. Supports search, category filter, and the "Recent" view.

- HTTP Method/Path: GET /boards
- Request Body: N/A
- Query Parameters (all optional):
  - `category` — filter by `Board.category`; a value of `All` is ignored (returns everything).
  - `title` — case-insensitive substring match on `Board.title`.
  - `sort` — when set to `recent`, returns the 6 most recently created boards.

Success Response:
- Status Code: 200
- Body Example (array, ordered by `createdAt` desc):
[
  {
    "id": 1,
    "createdAt": "2026-10-31T15:30:00Z",
    "title": "Quarterly Achievers",
    "category": "Celebration",
    "imageUrl": "https://example.com/cover1.jpg",
    "authorId": 1
  },
  {
    "id": 2,
    "createdAt": "2026-10-31T16:00:00Z",
    "title": "Thank You Wall",
    "category": "Thank you",
    "imageUrl": "https://example.com/cover2.jpg",
    "authorId": 3
  }
]

Error Response:
- Status Code: 500
{ "error": "Cannot retrieve boards." }

---

### POST /boards
Add a board to the list of boards.

- HTTP Method/Path: POST /boards
- Request Body:
{
  "title": "Quarterly Achievers",
  "category": "Celebration",
  "imageUrl": "https://example.com/cover1.jpg",
  "authorid": 1
}
  - `title` (required), `category` (required), `imageUrl` (optional), `authorName` (optional — blank resolves to the Guest user, id 1).
- Query Parameters: N/A

Success Response:
- Status Code: 201
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "updatedAt": "2026-10-31T15:30:00Z",
  "title": "Quarterly Achievers",
  "category": "Celebration",
  "imageUrl": "https://example.com/cover1.jpg",
  "authorId": 1,
  "cards" : []
}

Error Response:
- Status Code: 400
{ "error": "Cannot create board" }

---

### GET /boards/:id
Get one specific board, including its author and nested cards (each card with its author and comments).

- HTTP Method/Path: GET /boards/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "title": "Quarterly Achievers",
  "category": "Celebration",
  "imageUrl": "https://example.com/cover1.jpg",
  "authorId": 1,
  "author": { "id": 1, "username": "Guest", "email": "guest@kudos.local" },
}

Error Response:
- Status Code: 404
{ "error": "Board not found." }

---

### PUT /boards/:id
Update one specific board. Only the provided fields are changed.

- HTTP Method/Path: PUT /boards/:id
- Request Body (all fields optional):
{
  "title": "Updated Title",
  "category": "Inspiration",
  "imageUrl": "https://example.com/newcover.jpg"
}
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "updatedAt": "2026-11-01T10:00:00Z",
  "title": "Updated Title",
  "category": "Inspiration",
  "imageUrl": "https://example.com/newcover.jpg",
  "authorId": 1
}

Error Response:
- Status Code: 404
{ "error": "Board not found" }

---

### DELETE /boards/:id
Delete one specific board.

- HTTP Method/Path: DELETE /boards/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
{ "message": "Board deleted successfully." }


Error Response:
- Status Code: 404
{ "error": "Board not found" }

Note: deleting a board cascades (onDelete: Cascade) to its cards and their comments.

---

### GET /boards/:id/cards
Get all cards belonging to a board, ordered pinned-first (most recently pinned first), then unpinned by `createdAt` desc.

- HTTP Method/Path: GET /boards/:id/cards
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example (array):
[
  {
    "id": 2,
    "createdAt": "2026-10-31T16:00:00Z",
    "updatedAt": "2026-10-31T16:00:00Z",
    "title": "Finish Project",
    "description": "Complete backend API",
    "pinned": true,
    "pinnedAt": "2026-10-31T16:15:00Z",
    "gifUrl": "https://example.com/gif2.gif",
    "upvotes": 15,
    "authorId": 2,
    "boardId": 2
  },
  {
    "id": 1,
    "createdAt": "2026-10-31T15:30:00Z",
    "updatedAt": "2026-10-31T15:30:00Z",
    "title": "Study for Exam",
    "description": "Review chapters 1-5",
    "pinned": false,
    "pinnedAt": null,
    "gifUrl": "https://example.com/gif1.gif",
    "upvotes": 7,
    "authorId": 1,
    "boardId": 2
  }
]

Error Response:
- Status Code: 404
{ "error": "Cannot retrieve cards." }

---

## Cards

### GET /cards/:id
Get one specific card, including its author and comments.

- HTTP Method/Path: GET /cards/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "updatedAt": "2026-10-31T15:30:00Z",
  "title": "Study for Exam",
  "description": "Review chapters 1-5",
  "pinned": false,
  "pinnedAt": null,
  "gifUrl": "https://example.com/gif.gif",
  "upvotes": 7,
  "authorId": 1,
  "boardId": 2,
}

Error Response:
- Status Code: 404
{ "error": "Cannot retrieve card." }

---

### POST /cards
Create a card. Author is optional (blank resolves to the Guest user, id 1). Pinned should be the default value (false) and pinned at should be null.

- HTTP Method/Path: POST /cards
- Request Body:
{
  "title": "Study for Exam",
  "description": "Review chapters 1-5",
  "gifUrl": "https://example.com/gif.gif",
  "boardId": 2,
  "authorName": "exampleuser"
}
  - `title` (required), `gifUrl` (required), `boardId` (required), `description` (optional), `authorName` (optional).
- Path Parameters: N/A
- Query Parameters: N/A

Success Response:
- Status Code: 201
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "updatedAt": "2026-10-31T15:30:00Z",
  "title": "Study for Exam",
  "description": "Review chapters 1-5",
  "pinned": false,
  "pinnedAt": null,
  "gifUrl": "https://example.com/gif.gif",
  "upvotes": 0,
  "authorId": 1,
  "boardId": 2,
  "comments": []
}


Error Response:
- Status Code: 400
{ "error": "Cannot create card." }

---

### PUT /cards/:id
Update a specific card. Only the provided fields are changed. Also handles upvoting (`upvotes`) and pin/unpin (`pinned` — setting it updates `pinnedAt` automatically).

- HTTP Method/Path: PUT /cards/:id
- Request Body (all fields optional):

{
  "title": "Updated Title",
  "description": "Updated description",
  "gifUrl": "https://example.com/newgif.gif",
  "pinned": true,
  "upvotes": 8
}
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "createdAt": "2026-10-31T15:30:00Z",
  "updatedAt": "2026-11-01T10:00:00Z",
  "title": "Updated Title",
  "description": "Updated description",
  "pinned": true,
  "pinnedAt": "2026-11-01T10:00:00Z",
  "gifUrl": "https://example.com/newgif.gif",
  "upvotes": 8,
  "authorId": 1,
  "boardId": 2,
  "comments": []
}

Error Response:
- Status Code: 404
{ "error": "Card not found" }

---

### DELETE /cards/:id
Delete a specific card.

- HTTP Method/Path: DELETE /cards/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
{ "message": "Card deleted successfully." }

Error Response:
- Status Code: 404
{ "error": "Card not found" }

Note: deleting a card cascades (onDelete: Cascade) to its comments.

---

### GET /cards/:id/comments
Get a list of all of a card's comments, oldest first, each with its author.

- HTTP Method/Path: GET /cards/:id/comments
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example (array):
[
  {
    "id": 1,
    "message": "Great idea!",
    "authorId": 3,
    "cardId": 1,
    "createdAt": "2026-10-31T15:30:00Z",
  },
  {
    "id": 2,
    "message": "I agree.",
    "authorId": 2,
    "cardId": 1,
    "createdAt": "2026-10-31T16:00:00Z"
  }
]

Error Response:
- Status Code: 404
{ "error": "Card not found" }

---

### POST /cards/:id/comments
Create a comment on a card. Author is optional (blank resolves to the Guest user, id 1).

- HTTP Method/Path: POST /cards/:id/comments
- Request Body:
{
  "message": "Great idea!",
  "authorId": 3
}

- Query Parameters: id

Success Response:
- Status Code: 201
- Body Example:
{
  "id": 1,
  "message": "Great idea!",
  "cardId": 1,
  "authorId": 3,
  "createdAt": "2026-10-31T15:30:00Z"
}

Error Response:
- Status Code: 400
```json
{ "error": "Cannot create a comment." }
```

---

## Comments

### GET /comments/:id
Get a specific comment.

- HTTP Method/Path: GET /comments/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "message": "Great idea!",
  "cardId": 1,
  "authorId": 3,
  "createdAt": "2026-10-31T15:30:00Z"
}

Error Response:
- Status Code: 404

{ "error": "Comment not found." }

---

### PUT /comments/:id
Update a specific comment's message.

- HTTP Method/Path: PUT /comments/:id
- Request Body:
{ "message": "Updated comment." }

- Query Parameters: id

Success Response:
- Status Code: 200
- Body Example:
{
  "id": 1,
  "message": "Updated comment.",
  "cardId": 1,
  "authorId": 3,
  "createdAt": "2026-10-31T15:30:00Z"
}

Error Response:
- Status Code: 404
{ "error": "Comment not found" }
---

### DELETE /comments/:id
Delete a specific comment.

- HTTP Method/Path: DELETE /comments/:id
- Request Body: N/A
- Query Parameters: id

Success Response:
- Status Code: 200
{ "message": "Comment deleted successfully." }

Error Response:
- Status Code: 404
{ "error": "Comment not found" }

# Section 3: Database Schema Spec

Define the Prisma models for Board and Card before touching schema.prisma. For each model:

- Field names and data types
- Required vs. optional fields
- Relationships between models
- Any default values or constraints

When you implement schema.prisma in Milestone 2, it should reflect this spec. If you change a field name or type during implementation, update the spec — don't just change the code silently.

# Section 4: State Architecture

Define what state the frontend needs to manage. For each state variable:

- Data type and initial value
- Which component owns it
- What user action or event triggers an update
