import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { db } from "firebaseApp";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import AuthContext from "context/AuthContext";
import { toast } from "react-toastify";

interface PostListProps {
  hasNavigation?: boolean;
  defaultTab?: TabType | CategoryType;
}

export interface CommentsInterface {
  content: string;
  uid: string;
  email: string;
  createAt: string;
}

type TabType = "all" | "my";

export interface PostProps {
  id?: string;
  title: string;
  email: string;
  summary: string;
  createAt: string;
  content: string;
  updateAt?: string;
  uid: string;
  category?: CategoryType;
  comments?: CommentsInterface[];
}

export type CategoryType = "Frontend" | "Backend" | "Web" | "Native";
export const CATEGORIES: CategoryType[] = [
  "Frontend",
  "Backend",
  "Web",
  "Native",
];

export default function PostList({
  hasNavigation = true,
  defaultTab = "all",
}: PostListProps) {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<TabType | CategoryType>(
    defaultTab
  );
  const [posts, setPosts] = useState<PostProps[]>([]);

  console.log(user?.uid);

  const getPosts = async () => {
    setPosts([]);
    let postsRef = collection(db, "posts");
    let postQuery;

    if (activeTab === "my" && user) {
      //나의 글 필터링
      postQuery = query(
        postsRef,
        where("uid", "==", user?.uid),
        orderBy("createAt", "desc")
      );
    } else if (activeTab === "all") {
      // 모든 글 보여주기
      postQuery = query(postsRef, orderBy("createAt", "desc"));
    } else {
      // 카테고리 글 보여주기
      postQuery = query(
        postsRef,
        where("category", "==", activeTab),
        orderBy("createAt", "desc")
      );
    }

    const datas = await getDocs(postQuery);
    datas?.forEach((doc) => {
      const dataObj = { ...doc.data(), id: doc.id };
      setPosts((prev) => [...prev, dataObj as PostProps]);
    });
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("게시글을 삭제하시겠습니다?");

    if (confirm && id) {
      await deleteDoc(doc(db, "posts", id));

      toast.success("글이 삭제되었습니다.");
      getPosts();
    }
  };

  useEffect(() => {
    getPosts();
  }, [activeTab]);

  return (
    <>
      {hasNavigation && (
        <div className="post__navigation">
          <div
            role="presentation"
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "post__navigation--active" : ""}
          >
            전체
          </div>
          <div
            role="presentation"
            onClick={() => setActiveTab("my")}
            className={activeTab === "my" ? "post__navigation--active" : ""}
          >
            나의 글
          </div>
          {CATEGORIES?.map((category) => (
            <div
              key={category}
              role="presentation"
              onClick={() => setActiveTab(category)}
              className={
                activeTab === category ? "post__navigation--active" : ""
              }
            >
              {category}
            </div>
          ))}
        </div>
      )}
      <div className="post__list">
        {posts?.length > 0
          ? posts?.map((post, index) => (
              <div key={post?.id} className="post__box">
                <Link to={`/posts/${post?.id}`}>
                  <div className="post__profile-box">
                    <div className="post__profile" />
                    <div className="post__author-name">
                      {posts[index]?.email}
                    </div>
                    <div className="post__date">
                      {posts[index]?.updateAt
                        ? posts[index]?.updateAt
                        : posts[index]?.createAt}
                    </div>
                  </div>
                  <div className="post__title">{posts[index]?.title}</div>
                  <div className="post__content">{posts[index]?.summary}</div>
                </Link>
                {post?.email === user?.email && (
                  <div className="post__utils-box">
                    <div
                      role="presentation"
                      onClick={() => handleDelete(post.id as string)}
                      className="post__delete"
                    >
                      삭제
                    </div>
                    <div className="post__edit">
                      <Link to={`/posts/edit/${post?.id}`}>수정</Link>
                    </div>
                  </div>
                )}
              </div>
            ))
          : "게시글이 없습니다"}
      </div>
    </>
  );
}
