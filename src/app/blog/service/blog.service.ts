import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogRepository } from '../respository/blog.respository';
import { isEmpty } from 'class-validator';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async createBlog(blog: CreateBlogDto): Promise<any> {
    const {
      title,
      contents,
      metaTitle,
      metaDescription,
      author,
      tags,
      coverImage,
      images,
      slug,
      schemaMarkup,
    } = blog;
    try {
      const newBlog = await this.blogRepository.createBlog({
        title,
        contents,
        metaTitle,
        metaDescription,
        author,
        tags,
        coverImage,
        images,
        slug,
        schemaMarkup,
      });
      return newBlog;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateBlog(blog: UpdateBlogDto): Promise<any> {
    try {
      const {
        id,
        title,
        contents,
        metaTitle,
        metaDescription,
        author,
        tags,
        coverImage,
        images,
        slug,
        schemaMarkup,
      } = blog;

      console.log(blog, "in services too")
      const updatedBlog = await this.blogRepository.updatePost({
        id,
        title,
        contents,
        metaTitle,
        metaDescription,
        author,
        tags,
        coverImage,
        images,
        slug,
        schemaMarkup,
      });
      return updatedBlog;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getBlog(): Promise<any> {
    try {
      const blog = await this.blogRepository.fetchAllBlog();
      return blog;
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getBlogBySlug({slug}): Promise<any> {
    console.log(slug)
    try {
      if (isEmpty(slug))
        throw new HttpException(
          'Slug parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.blogRepository.fetchBlogBySlug( slug);
    } catch (error) {}
  }

   async getBlogById(id: string): Promise<any> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      return this.blogRepository.fetchBlogById({ id });
    } catch (error) {}
  }

   async deleteBlogById(id: string): Promise<void> {
    try {
      if (isEmpty(id))
        throw new HttpException(
          'Id parameter is required.',
          HttpStatus.BAD_REQUEST,
        );
      await this.blogRepository.deleteBlogById(id);
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

