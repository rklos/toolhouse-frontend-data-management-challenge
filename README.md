# Engineering @ Toolhouse - Technical Take home assignment

## Setup and run instructions

1. **Install dependencies**  
   Run the following command in the project root:
   ```
   npm install
   ```

2. **Start the development server**  
   ```
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

3. **Build for production**  
   ```
   npm run build
   ```
   The output will be in the `dist/` directory.

4. **Preview the production build**  
   ```
   npm run preview
   ```

---

## How to execute tests

1. **Run all tests (unit and integration):**
   ```
   npm test
   ```
   or
   ```
   npm run test
   ```

2. **Run tests in watch mode (for development):**
   ```
   npm run test:watch
   ```

Test files are located mainly in `src/components/items-list/__tests__/`.  
Tests use [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).

## Architecture decisions and design rationale
- Heavy pagination logic has been extracted into a separate custom hook to keep it in one place and to make the PaginatedList more readable.
- ConfirmationModal and AddItemModal share some common elements, which were extracted into a common BaseModal component.
- PaginatedList and List are separate components to allow using List in different places in the future (not every list needs to be paginated).
- Newly added items are placed at the beginning of the list for better UX and simpler code. Searching for the new item in the whole list and then changing the page to show the item to the user could be quite problematic and not very user-friendly.


## Performance optimization strategies
Some handlers are wrapped with useCallback to reduce redundant rerenders. Also I tried to avoid using useEffect because overusing it (and using it wrongly) can lead into performance problem.
There are still some rerenders that could be mitigated, but too much memoization in the code can significantly reduce readability. Therefore, a good practice is to measure whether those rerenders are truly problematic and decide if it's worth sacrificing code clarity.
One of the newest React features is the React Compiler. It wraps handlers and properties automatically with useCallback and useMemo, so we don't need to do it ourselves. I've used it in this project to maximize performance.

## AI tool usage notes
The entire project architecture, component structure, and logic extracted into custom hooks are my independent decisions.
I used AI autocompletes during coding, vibe-coded the modals (although I made some styling fixes and extracted common modal logic into BaseModal.tsx), and generated unit tests for business logic.
AI is really helpful in writing tests because it does 80% of the job. I only made some fixes (because some generated tests were broken from the beginning) and did a general checkup to ensure they made sense.

## Future Improvements
- PaginatedList, List, and Item could be refactored to be more generic, enabling their use for any kind of list.
- Modals were vibe-coded and look okay, but a small refactor is recommended to simplify the HTML and their logic.
- Toast and Button components should have "modes" to easily change their color (e.g., "success", "error", "info").
- Add failure handling for other endpoints.

## General notes
According to the instructions, the expected timebox for this task is 90 minutes.
This is highly underestimated, and in my opinion, it is impossible to complete the task while fulfilling all the acceptance criteria and maintaining high quality in this amount of time (even using AI).
I wanted to do the task as well as possible, putting all my effort into shipping something that would show my full potential, so I decided to give myself unlimited time.
It took me several hours to deliver what you see — you can follow the commit history to see the progress.
