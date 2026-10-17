import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle } from "lucide-react";
import { books } from "../../content/items/books";
import type { ContentItem } from "../../content/types";
import CaseFileModal from "../../components/modal/CaseFileModal";
import { clsx } from "clsx";
import SEOHead from "../../components/ui/SEOHead";
import LazyImage from "../../components/ui/LazyImage";
import Container from "../../components/layout/Container";

export default function BooksPage() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shuffledBooks, setShuffledBooks] = useState<ContentItem[]>(books);

  // Shuffle books for "surprise me" feature
  const handleShuffle = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      const shuffled = [...books].sort(() => Math.random() - 0.5);
      setShuffledBooks(shuffled);
      setSelectedItem(null);
    }, 200);
  };

  const handleBookClick = (book: ContentItem) => {
    setSelectedItem(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  };

  // Generate book spine colors (subtle variations)
  const getBookSpineColor = (index: number) => {
    const hues = [
      "hsl(200, 40%, 25%)", // Blue
      "hsl(280, 30%, 25%)", // Purple
      "hsl(340, 35%, 25%)", // Pink
      "hsl(40, 45%, 25%)",  // Gold
      "hsl(160, 35%, 25%)", // Teal
      "hsl(20, 40%, 25%)",  // Orange
      "hsl(120, 30%, 25%)", // Green
      "hsl(0, 35%, 25%)",   // Red
    ];
    return hues[index % hues.length];
  };

  return (
    <>
      <SEOHead title="Books" />
      <div className="py-12 pb-12">
        {/* Header */}
        <Container className="mb-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--fg-0))] mb-4"
              >
                Bookshelf
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg sm:text-xl text-[rgb(var(--fg-1))] max-w-prose leading-relaxed"
              >
                A curated collection of books that have shaped my thinking and journey.
              </motion.p>
            </div>

            {/* Surprise me button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              onClick={handleShuffle}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-out",
                "bg-ink/5 hover:bg-ink/10 active:bg-ink/15",
                "border border-line/10 hover:border-line/20",
                "text-sm font-medium text-[rgb(var(--fg-0))]",
                "hover:-translate-y-0.5 active:translate-y-0",
                "hover:shadow-[0_4px_12px_rgba(120,220,255,0.15)]",
                "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-2 focus:ring-offset-transparent",
                "group"
              )}
            >
              <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Surprise me</span>
            </motion.button>
          </div>
        </Container>

        {/* Bookshelf */}
        <Container>
          <AnimatePresence mode="popLayout">
            <div className="space-y-3 md:space-y-4">
              {shuffledBooks.map((book, index) => (
                <BookSpine
                  key={book.id}
                  book={book}
                  index={index}
                  spineColor={getBookSpineColor(index)}
                  onClick={() => handleBookClick(book)}
                  isSelected={selectedItem?.id === book.id}
                />
              ))}
            </div>
          </AnimatePresence>
        </Container>

        {/* Case File Modal */}
        <CaseFileModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}

/**
 * Extract initials from book title (e.g., "The Great Gatsby" -> "TGG" or "TG")
 */
function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return "?";
  
  // Take first letter of first 2-3 words, or just first 2-3 letters if single word
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  const initials = words
    .slice(0, Math.min(3, words.length))
    .map(word => word[0].toUpperCase())
    .join("");
  
  return initials;
}

interface BookCoverFallbackProps {
  title: string;
}

function BookCoverFallback({ title }: BookCoverFallbackProps) {
  const initials = getInitials(title);
  
  return (
    <div className="relative w-full h-[72px] md:h-[88px] rounded-lg overflow-hidden bg-gradient-to-br from-[rgb(var(--bg-1))] to-[rgb(var(--bg-0))] border border-line/10 flex items-center justify-center">
      <span className="text-lg md:text-xl font-bold text-[rgb(var(--fg-0))] opacity-80">
        {initials}
      </span>
    </div>
  );
}

interface BookSpineProps {
  book: ContentItem;
  index: number;
  spineColor: string;
  onClick: () => void;
  isSelected: boolean;
}

function BookSpine({
  book,
  index,
  spineColor,
  onClick,
  isSelected,
}: BookSpineProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ x: 8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        "group relative w-full h-20 md:h-24 rounded-lg overflow-hidden",
        "flex items-center gap-4 px-6 md:px-8",
        "glass border transition-all",
        isSelected
          ? "border-[rgb(var(--accent))]/60 ring-2 ring-[rgb(var(--accent))]/40"
          : "border-line/10 hover:border-line/20",
        "focus:outline-none focus:ring-2 focus:ring-line/20 focus:ring-offset-2 focus:ring-offset-transparent"
      )}
    >
      {/* Spine color accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: spineColor }}
      />

      {/* Book cover - fixed width left column */}
      <div className="relative z-10 flex-shrink-0 w-[90px] md:w-[120px] h-full flex items-center">
        {book.media.heroImage ? (
          <div className="relative w-full h-[72px] md:h-[88px] rounded-lg overflow-hidden">
            <LazyImage
              src={book.media.heroImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <BookCoverFallback title={book.card.headline || book.title} />
        )}
      </div>

      {/* Book info */}
      <div className="relative z-10 flex-1 text-left min-w-0">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[rgb(var(--fg-0))] mb-1 group-hover:text-[rgb(var(--accent))] transition-colors truncate">
          {book.title}
        </h3>
        <p className="text-sm sm:text-base text-[rgb(var(--fg-1))] line-clamp-2 max-w-prose">
          {book.card.subhead || book.card.oneLiner}
        </p>
        {book.beats && book.beats.length > 0 && (
          <p className="text-xs sm:text-sm text-[rgb(var(--fg-1))] mt-1 opacity-80 line-clamp-1">
            {book.beats[0]}
          </p>
        )}
      </div>

      {/* Tags preview */}
      {book.tags.length > 0 && (
        <div className="relative z-10 flex-shrink-0 hidden md:flex items-center gap-2">
          {book.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-ink/5 border border-line/10 text-xs text-[rgb(var(--fg-1))]"
            >
              {tag}
            </span>
          ))}
          {book.tags.length > 2 && (
            <span className="text-xs text-[rgb(var(--fg-1))]">
              +{book.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent))]/0 via-[rgb(var(--accent))]/5 to-[rgb(var(--accent))]/0"
        initial={{ opacity: 0, x: "-100%" }}
        whileHover={{ opacity: 1, x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.button>
  );
}
