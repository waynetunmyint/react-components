import { IonContent, IonPage } from '@ionic/react';
import { useState, useEffect } from 'react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { BASE_URL, FOOTER_STYLE, IMAGE_URL, PAGE_ID } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import { FileText, ExternalLink, ChevronDown } from 'lucide-react';

interface Book {
    Id?: string | number;
    Title?: string;
    PreviewPDF?: string;
    BookAuthorTitle?: string;
    Thumbnail?: string;
}

const PDFViewPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchBooks = async (page: number, append = false) => {
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const response = await fetch(`${BASE_URL}/book/api/byPageId/byPage/${PAGE_ID}/${page}`);
            const data = await response.json();

            // Filter only books that have PreviewPDF
            const booksWithPDF = data.filter((book: Book) => book.PreviewPDF && book.PreviewPDF !== 'logo.png');

            if (booksWithPDF.length === 0) {
                setHasMore(false);
            } else {
                if (append) {
                    setBooks(prev => [...prev, ...booksWithPDF]);
                } else {
                    setBooks(booksWithPDF);
                }
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchBooks(1);
    }, []);

    const handleViewMore = () => {
        const nextPage = pageNo + 1;
        setPageNo(nextPage);
        fetchBooks(nextPage, true);
    };

    const openPDF = (pdfPath: string) => {
        const fullUrl = `${IMAGE_URL}/uploads/${pdfPath}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <IonPage>
            <HeaderSwitcher styleNo={8} headingField="Preview PDFs" />
            <IonContent fullscreen>
                <div className='min-h-screen p-5 bg-gray-50'>
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Preview PDFs</h1>
                            <p className="text-gray-600">Browse and read sample chapters from our collection</p>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" style={{ borderTopColor: 'var(--theme-primary-bg)' }}></div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && books.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                                <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview PDFs Available</h3>
                                <p className="text-gray-500">Check back later for book previews</p>
                            </div>
                        )}

                        {/* PDF List */}
                        {!isLoading && books.length > 0 && (
                            <div className="grid gap-4">
                                {books.map((book) => (
                                    <div
                                        key={book.Id}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between group cursor-pointer"
                                        onClick={() => openPDF(book.PreviewPDF!)}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Book Thumbnail */}
                                            <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                {book.Thumbnail && book.Thumbnail !== 'logo.png' ? (
                                                    <img
                                                        src={`${IMAGE_URL}/uploads/${book.Thumbnail}`}
                                                        alt={book.Title || 'Book cover'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Book Info */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                                    {book.Title || 'Untitled'}
                                                </h3>
                                                {book.BookAuthorTitle && (
                                                    <p className="text-sm text-gray-500">{book.BookAuthorTitle}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Open Button */}
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                                            style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openPDF(book.PreviewPDF!);
                                            }}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="hidden sm:inline">Preview Book</span>
                                        </button>
                                    </div>
                                ))}

                                {/* View More Button */}
                                {hasMore && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={handleViewMore}
                                            disabled={isLoadingMore}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-5 w-5" />
                                                    <span>View More</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <FooterSwitchComp styleNo={FOOTER_STYLE} />
            </IonContent>
        </IonPage>
    );
};

export default PDFViewPage;
