import { Link, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "firebaseApp";
import { useState, useEffect, useContext } from "react";
import { PostProps } from "./PostList";
import Loader from "./Loader";
import AuthContext from "context/AuthContext";
import { toast } from "react-toastify";
import Comments from "./Comments";

export default function PostDetail() {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState<PostProps | null>(null);
  const params = useParams();
  const navigate = useNavigate();

  const getPost = async (id: string) => {
    if (id) {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      setPost({ id: docSnap.id, ...(docSnap.data() as PostProps) });
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("게시글을 삭제하시겠습니다?");

    try {
      if (confirm && post && post?.id) {
        await deleteDoc(doc(db, "posts", post?.id));

        toast.success("글이 삭제되었습니다.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error?.code);
    }
  };

  useEffect(() => {
    if (params?.id) getPost(params?.id);
  }, [params?.id]);

  return (
    <>
      <div className="post__detail">
        {post ? (
          <>
            <div className="post__box">
              <div className="post__title">{post?.title}</div>
              <div className="post__profile-box">
                <div className="post__profile" />
                <div className="post__author-name">{post?.email}</div>
                <div className="post__date">
                  {post?.updateAt
                    ? `${post?.updateAt} (수정됨)`
                    : post?.createAt}
                </div>
              </div>
              <div className="post__utils-box">
                <div className="post__category">
                  {post?.category || "자유주제"}
                </div>
                {post?.email === user?.email && (
                  <>
                    <div
                      role="presentation"
                      onClick={handleDelete}
                      className="post__delete"
                    >
                      삭제
                    </div>
                    <div className="post__edit">
                      <Link to={`/posts/edit/${post?.id}`}>수정</Link>
                    </div>
                  </>
                )}
              </div>
              <div className="post__content post__content--pre-wrap">
                {post?.content}
              </div>
            </div>
            <Comments post={post} getPost={getPost} />
          </>
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
}
