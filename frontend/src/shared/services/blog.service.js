import API from '../../core/api/client';

export const getBlogs = () => API.get('/seo/blogs');
export const getBlogBySlug = (slug) => API.get(`/seo/blogs/${slug}`);

// Admin Blog CRUD
export const adminGetBlogs = () => API.get('/seo/admin/blogs');
export const adminCreateBlog = (data) => API.post('/seo/admin/blogs', data);
export const adminUpdateBlog = (id, data) => API.put(`/seo/admin/blogs/${id}`, data);
export const adminDeleteBlog = (id) => API.delete(`/seo/admin/blogs/${id}`);
