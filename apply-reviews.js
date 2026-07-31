const fs = require('fs');

// --- 1. UPDATE PRODUCT PAGE ---
const productPagePath = 'd:\\rohit projects\\rudra\\src\\app\\product\\[id]\\page.tsx';
let prodContent = fs.readFileSync(productPagePath, 'utf8');

// Imports
prodContent = prodContent.replace(
  'import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";',
  'import { doc, getDoc, getDocs, collection, query, where, addDoc, serverTimestamp, orderBy } from "firebase/firestore";'
);

// Review Interface
const reviewInterface = `
export interface Review {
  id?: string;
  productId: string;
  clientName: string;
  rating: number;
  comment: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  createdAt?: any;
}
`;
if (!prodContent.includes('export interface Review')) {
  prodContent = prodContent.replace('interface CartItem {', reviewInterface + '\ninterface CartItem {');
}

// Review State
const reviewState = `
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
`;
if (!prodContent.includes('const [reviewName, setReviewName]')) {
  prodContent = prodContent.replace('  const [toastMessage, setToastMessage] = useState<string | null>(null);', '  const [toastMessage, setToastMessage] = useState<string | null>(null);\n' + reviewState);
}

// Fetch Reviews inside fetchProductData
const fetchReviews = `
          // Fetch approved reviews
          const reviewsQ = query(collection(db, "reviews"), where("productId", "==", prodDoc.id), where("status", "==", "approved"));
          const reviewsSnap = await getDocs(reviewsQ);
          const reviewsData = reviewsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Review));
          setReviews(reviewsData);
`;
if (!prodContent.includes('setReviews(reviewsData)')) {
  prodContent = prodContent.replace('setProduct({ ...prodData, id: prodDoc.id });', 'setProduct({ ...prodData, id: prodDoc.id });\n' + fetchReviews);
}

// submitReview handler
const submitReviewFn = `
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        clientName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setToastMessage("Your review has been submitted and is pending approval!");
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };
`;
if (!prodContent.includes('const submitReview')) {
  prodContent = prodContent.replace('  const handleUpdateQuantity = ', submitReviewFn + '\n  const handleUpdateQuantity = ');
}

// Reviews UI
const reviewsUI = `
        {/* CUSTOMER REVIEWS SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#B0B7C3]">
          <h2 className="text-center font-serif text-3xl text-[#0D3C6A] font-light uppercase tracking-wider mb-12">
            Customer Reviews
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Reviews List */}
            <div className="space-y-8">
              <h3 className="font-serif text-xl text-[#0D3C6A] uppercase tracking-wider border-b border-[#B0B7C3] pb-3">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h3>
              
              {reviews.length === 0 ? (
                <p className="text-[#00A896] text-sm">Be the first to review this product!</p>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-none">
                  {reviews.map((r, idx) => (
                    <div key={idx} className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#B0B7C3]">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-[#0D3C6A] uppercase tracking-widest text-xs">{r.clientName}</span>
                        <div className="flex text-[#BCAE9E]">
                          {Array.from({length: 5}).map((_, i) => (
                            <span key={i} className={i < r.rating ? "text-[#0D3C6A]" : "text-[#BCAE9E]/40"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#00A896] leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="bg-white p-8 rounded-3xl border border-[#B0B7C3] shadow-sm">
              <h3 className="font-serif text-xl text-[#0D3C6A] uppercase tracking-wider mb-6">
                Write a Review
              </h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Name</label>
                  <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Rating</label>
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]">
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Poor</option>
                    <option value="1">1 Star - Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D3C6A] uppercase tracking-widest mb-1">Review</label>
                  <textarea required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} className="w-full border border-[#B0B7C3] rounded-xl px-4 py-3 text-xs bg-[#FAF6F0] focus:outline-none focus:border-[#5BA6D6]" placeholder="What did you think of this product?"></textarea>
                </div>
                <button disabled={reviewSubmitting} type="submit" className="w-full bg-[#0D3C6A] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50 mt-2">
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </section>
`;
if (!prodContent.includes('CUSTOMER REVIEWS SECTION')) {
  prodContent = prodContent.replace('</main>', reviewsUI + '\n      </main>');
}

fs.writeFileSync(productPagePath, prodContent, 'utf8');


// --- 2. UPDATE ADMIN PAGE ---
const adminPagePath = 'd:\\rohit projects\\rudra\\src\\app\\admin\\page.tsx';
let adminContent = fs.readFileSync(adminPagePath, 'utf8');

// Imports
adminContent = adminContent.replace(
  'import { collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";',
  'import { collection, getDocs, doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";'
);

// Review Interface
const adminReviewInterface = `
interface Review {
  id: string;
  productId: string;
  clientName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: any;
}
`;
if (!adminContent.includes('interface Review {')) {
  adminContent = adminContent.replace('interface OrderDetails {', adminReviewInterface + '\ninterface OrderDetails {');
}

// Review State
if (!adminContent.includes('const [reviews, setReviews]')) {
  adminContent = adminContent.replace('const [orders, setOrders] = useState<OrderDetails[]>([]);', 'const [orders, setOrders] = useState<OrderDetails[]>([]);\n  const [reviews, setReviews] = useState<Review[]>([]);');
}

// Fetch Reviews inside useEffect
const fetchReviewsAdmin = `
    const unsubscribeReviews = onSnapshot(collection(db, "reviews"), (querySnapshot) => {
      const reviewsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
      reviewsList.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setReviews(reviewsList);
    });
`;
if (!adminContent.includes('unsubscribeReviews')) {
  adminContent = adminContent.replace('const unsubscribeOrders = onSnapshot(collection(db, "orders"),', fetchReviewsAdmin + '\n    const unsubscribeOrders = onSnapshot(collection(db, "orders"),');
  adminContent = adminContent.replace('return () => unsubscribeOrders();', 'return () => { unsubscribeOrders(); unsubscribeReviews(); };');
}

// Handle Update Review Status
const handleUpdateReviewStatus = `
  const handleUpdateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), { status: newStatus });
    } catch (err) {
      console.error("Failed to update review status:", err);
      alert("Failed to update review status.");
    }
  };
`;
if (!adminContent.includes('const handleUpdateReviewStatus')) {
  adminContent = adminContent.replace('const handleUpdateOrderStatus =', handleUpdateReviewStatus + '\n  const handleUpdateOrderStatus =');
}

// Reviews Tab UI
const reviewsTabUI = `
              {/* ============================ REVIEWS ============================ */}
              {activeSection === "Reviews" && (
                <div className="space-y-6">
                  <SectionHeader title="Customer Reviews" subtitle="Manage and approve product reviews" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 bg-gradient-to-br from-white to-[#FAF6F0]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><MessageSquare className="w-5 h-5"/></div>
                        <div>
                          <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Total Reviews</p>
                          <h3 className="text-3xl font-serif text-[#0D3C6A] mt-1">{reviews.length}</h3>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-white to-[#FAF6F0]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Clock className="w-5 h-5"/></div>
                        <div>
                          <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Pending</p>
                          <h3 className="text-3xl font-serif text-[#0D3C6A] mt-1">{reviews.filter(r => r.status === 'pending').length}</h3>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-gradient-to-br from-white to-[#FAF6F0]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Star className="w-5 h-5"/></div>
                        <div>
                          <p className="text-[10px] text-[#00A896] uppercase tracking-widest font-bold">Approved</p>
                          <h3 className="text-3xl font-serif text-[#0D3C6A] mt-1">{reviews.filter(r => r.status === 'approved').length}</h3>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="border-b border-[#B0B7C3] bg-[#FAF6F0]/50 text-[10px] uppercase tracking-widest text-[#00A896]">
                            <th className="p-4 font-semibold">Client Name</th>
                            <th className="p-4 font-semibold">Product ID</th>
                            <th className="p-4 font-semibold">Rating</th>
                            <th className="p-4 font-semibold">Comment</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#B0B7C3]/50">
                          {reviews.map((r) => (
                            <tr key={r.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-4">
                                <span className="text-sm font-semibold text-[#0D3C6A]">{r.clientName}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-xs text-[#00A896] font-mono bg-neutral-100 px-2 py-1 rounded">{r.productId.substring(0, 8)}...</span>
                              </td>
                              <td className="p-4 text-amber-500 text-sm">
                                {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                              </td>
                              <td className="p-4">
                                <p className="text-xs text-neutral-600 line-clamp-2 max-w-xs">{r.comment}</p>
                              </td>
                              <td className="p-4">
                                <Pill tone={r.status === 'approved' ? 'green' : r.status === 'pending' ? 'amber' : 'red'}>
                                  {r.status}
                                </Pill>
                              </td>
                              <td className="p-4 text-right">
                                {r.status === 'pending' && (
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleUpdateReviewStatus(r.id, 'approved')} className="text-[10px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors uppercase tracking-widest">
                                      Approve
                                    </button>
                                    <button onClick={() => handleUpdateReviewStatus(r.id, 'rejected')} className="text-[10px] font-bold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors uppercase tracking-widest">
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {r.status !== 'pending' && (
                                  <span className="text-[10px] text-[#BCAE9E] font-bold uppercase tracking-widest">
                                    Resolved
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {reviews.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-sm text-[#00A896]">No reviews found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
`;

if (!adminContent.includes('activeSection === "Reviews"')) {
  adminContent = adminContent.replace('{/* ============================ SETTINGS ============================ */}', reviewsTabUI + '\n              {/* ============================ SETTINGS ============================ */}');
}

fs.writeFileSync(adminPagePath, adminContent, 'utf8');

console.log("Applied reviews feature to product/[id]/page.tsx and admin/page.tsx");
