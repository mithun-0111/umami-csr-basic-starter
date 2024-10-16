"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Article } from "@/components/drupal/Article";
import { BasicPage } from "@/components/drupal/BasicPage";
import { drupal } from "@/lib/drupal";
import type { DrupalNode, JsonApiParams } from "next-drupal";

async function getNode(slug: string[]): Promise<DrupalNode> {
  const path = `/${slug.join("/")}`;
  const params: JsonApiParams = {};

  // Translating the path to discover the entity type.
  const translatedPath = await drupal.translatePath(path);
  if (!translatedPath) {
    throw new Error("Resource not found");
  }

  const type = translatedPath.jsonapi?.resourceName!;
  const uuid = translatedPath.entity.uuid;

  if (type === "node--article") {
    params.include = "field_media_image.field_media_image,uid";
  }

  const resource = await drupal.getResource<DrupalNode>(type, uuid, { params });
  if (!resource) {
    throw new Error(`Failed to fetch resource: ${translatedPath?.jsonapi?.individual}`);
  }

  return resource;
}

type NodePageProps = {
  params: { slug: string[] };
};

export default function NodePage({ params }: NodePageProps) {
  const [node, setNode] = useState<DrupalNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNode = async () => {
      try {
        const fetchedNode = await getNode(params.slug);
        setNode(fetchedNode);
      } catch (err) {
        console.log(err);
        // setError(err.message);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadNode();
  }, [params.slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {node?.type === "node--page" && <BasicPage node={node} />}
      {node?.type === "node--article" && <Article node={node} />}
    </>
  );
}
