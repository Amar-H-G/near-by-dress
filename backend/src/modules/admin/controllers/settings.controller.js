const Settings = require('../../../models/Settings');
const { sendSuccess } = require('../../../utils/response');

exports.getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return sendSuccess(res, { data: settings });
};

exports.updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const { siteName, primaryColor, secondaryColor, contactEmail, contactPhone } = req.body;
  if (siteName) settings.siteName = siteName;
  if (primaryColor) settings.primaryColor = primaryColor;
  if (secondaryColor) settings.secondaryColor = secondaryColor;
  if (contactEmail) settings.contactEmail = contactEmail;
  if (contactPhone) settings.contactPhone = contactPhone;

  if (req.files && req.files.logo) {
    settings.logo = req.files.logo[0].path;
  }

  await settings.save();
  return sendSuccess(res, { data: settings }, 'Settings updated successfully');
};
