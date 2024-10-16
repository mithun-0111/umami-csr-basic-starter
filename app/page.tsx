"use client"
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { ArticleTeaser } from "@/components/drupal/ArticleTeaser";
import { drupal } from "@/lib/drupal";
import type { DrupalNode } from "next-drupal";

export default function Home() {
  const [nodes, setNodes] = useState<DrupalNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const fetchedNodes = await drupal.getResourceCollection<DrupalNode[]>(
          "node--article",
          {
            params: {
              "filter[status]": 1,
              "fields[node--article]": "title,path,field_media_image,uid,created",
              include: "field_media_image.field_media_image,uid",
              sort: "-created",
            },
          }
        );
        setNodes(fetchedNodes);
      } catch (err) {
        setError("Failed to fetch nodes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <h1 className="mb-10 text-6xl font-black">Latest Articles.</h1>
      {nodes.length ? (
        nodes.map((node) => (
          <div key={node.id}>
            <ArticleTeaser node={node} />
            <hr className="my-20" />
          </div>
        ))
      ) : (
        <p className="py-4">No nodes found</p>
      )}
    </>
  );
}
