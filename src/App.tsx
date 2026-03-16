
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultList } from './components/ResultList';
import { useDictionary } from './hooks/useDictionary';
import { useWordSelection } from './hooks/useWordSelection';
import { useTranslation } from './hooks/useTranslation';
import { TranslationPopup } from './components/translation/TranslationPopup';

// Actually, since I don't have the user's URL, I should probably put a placeholder UI or a default ONE if I had one.
// The user request didn't provide one. I'll use an empty string and handle the "No Data" state gracefully
// OR better, I can create a local mock data for demonstration if the URL fails or is empty.
// Let's stick to the URL passing.

function App() {
  // Using a sample URL or empty string. Ideally this is an Env Var.
  // For demo purposes, if this is empty, the app shows empty.
  // Use the provided Google Sheet URL as default
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/1qTwcWdQY2YxELXoKUE4jaj9bpImpnfKGE3gAEQIqR_g/edit?usp=sharing';

  const { data, results, loading, search, detectedLanguage, currentQuery } = useDictionary(sheetUrl);

  // Translation Feature Hooks
  const { selection, setSelection } = useWordSelection();
  const { translation, loading: translationLoading } = useTranslation(selection.text, data, selection.isVisible);

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-50 to-spiritual-100 px-4 sm:px-6 lg:px-8 font-sans selection:bg-primary-200 connection-lines">
      <div className="max-w-4xl mx-auto pb-20">
        <Header />

        <div className="sticky top-4 z-10 backdrop-blur-md rounded-2xl bg-white/30 p-2 shadow-sm border border-white/40 mb-8 transition-all duration-300">
          <SearchBar
            onSearch={search}
            detectedLanguage={detectedLanguage}
            currentQuery={currentQuery}
          />
        </div>

        <main>
          <ResultList
            results={results}
            loading={loading}
            hasQuery={!!currentQuery}
          />
        </main>
      </div>

      {/* Translation Popup Portal/Overlay */}
      <TranslationPopup
        position={selection.position}
        isVisible={selection.isVisible}
        translation={translation}
        loading={translationLoading}
        onClose={() => setSelection(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default App;
